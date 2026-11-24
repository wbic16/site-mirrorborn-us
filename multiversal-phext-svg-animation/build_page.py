#!/usr/bin/env python3
"""Build the publishable page: inject the example chain's per-frame states
into publish/index.html as inline JSON for the playable-multiverse player.

The player's data is generated here, from example.phext, by the same
chain walk generate.py uses — never hand-transcribed. The page template
carries the marker line

    const FRAMES = /*__FRAMES__*/ null;

and this script replaces it with the real data, then verifies its own
work: the JSON embedded in the built page is extracted back out and
compared, value by value, against the chain it came from, and against
the SMIL values in example.svg.
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate import split_chain, parse_member, parse_state, META_ADDR  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(HERE, "publish", "index.html")
MARKER = "const FRAMES = /*__FRAMES__*/ null;"


def frames_from_chain():
    data = open(os.path.join(HERE, "example.phext"), "rb").read()
    frames = [parse_member(m) for m in split_chain(data)]
    _, meta = parse_state(frames[0][META_ADDR])
    tracks = [a for a in frames[0] if a != META_ADDR and frames[0][a].strip()]
    universes = []
    for i, frame in enumerate(frames, start=1):
        scrolls = {}
        for addr in tracks:
            element, attrs = parse_state(frame[addr])
            scrolls[addr] = {"element": element, "attrs": attrs}
        universes.append({"n": i, "scrolls": scrolls})
    return {"meta": meta, "tracks": tracks, "universes": universes}


def main():
    payload = frames_from_chain()
    html = open(PAGE, encoding="utf-8").read()
    if MARKER not in html:
        if "const FRAMES = {" in html:
            print("page already built (marker replaced); rebuilding from data")
            html = re.sub(r"const FRAMES = \{.*?\};",
                          MARKER, html, count=1, flags=re.S)
        else:
            raise SystemExit("marker not found in page — cannot inject")
    built = html.replace(
        MARKER, "const FRAMES = " + json.dumps(payload) + ";")
    open(PAGE, "w", encoding="utf-8").write(built)

    # Verify: extract the embedded JSON back out of the built page and
    # compare it against a fresh read of the chain.
    m = re.search(r"const FRAMES = (\{.*?\});", built, flags=re.S)
    embedded = json.loads(m.group(1))
    fresh = frames_from_chain()
    assert embedded == fresh, "embedded player data != chain data"
    n = len(embedded["universes"])
    print(f"player data: {n} universes embedded, matches the chain exactly")

    # Cross-check against the SMIL route: every animate values= list in
    # example.svg must equal the player's per-frame values for that
    # attribute, in order.
    ns = "{http://www.w3.org/2000/svg}"
    root = ET.parse(os.path.join(HERE, "example.svg")).getroot()
    # The SVG's element children, in order, are the background rect and
    # then one element per track, in track order. Pair them up.
    children = [el for el in root if isinstance(el.tag, str)]
    body = children[1:]  # skip the background rect
    assert len(body) == len(embedded["tracks"]), (len(body), embedded["tracks"])
    checked = 0
    for el, addr in zip(body, embedded["tracks"]):
        for anim in el.findall(f"{ns}animate"):
            name = anim.get("attributeName")
            values = anim.get("values").split(";")
            per = [u["scrolls"][addr]["attrs"][name]
                   for u in embedded["universes"]]
            assert per == values, (addr, name, per, values)
            checked += 1
    print(f"player data vs example.svg: {checked} animate lists agree — PASS")


if __name__ == "__main__":
    main()
