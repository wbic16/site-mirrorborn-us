#!/usr/bin/env python3
"""Read example.phext (a chain) and emit example.svg with SMIL animation.

Stdlib only. The chain walk is done here, by hand, because the Python
parser on this machine (~/workspace/phext/parse_phext.py) parses a single
phext and does not split chains: bytes 0x02 and 0x03 are not delimiters
to it, so they would pass through as content. So: split the file on the
chain delimiter 0x02, require the chain close 0x03, then hand each
member to parse_phext as an ordinary phext.

Playback model: one universe = one frame. The same address in successive
universes is the same element at successive times — a track. For each
track, an attribute whose value changes across frames becomes a SMIL
<animate> whose values= list is the per-frame values in chain order;
an attribute that never changes stays a plain attribute.
"""
import sys
import tempfile
import os
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.expanduser("~/workspace/phext"))
import parse_phext  # noqa: E402  (the single-phext delimiter-walk parser)

CHAIN = b"\x02"
CLOSE = b"\x03"
META_ADDR = "1.1.1/1.1.1/1.1.1"


def split_chain(data):
    if not data.endswith(CLOSE):
        raise SystemExit("chain has no close byte 0x03 — it was truncated")
    body = data[:-1]
    return body.split(CHAIN)


def parse_member(member_bytes):
    with tempfile.NamedTemporaryFile("wb", suffix=".phext",
                                     delete=False) as t:
        t.write(member_bytes)
        path = t.name
    try:
        return dict(parse_phext.parse(path))
    finally:
        os.unlink(path)


def parse_state(text):
    lines = [ln for ln in text.strip().splitlines() if ln.strip()]
    attrs = {}
    for ln in lines[1:]:
        k, _, v = ln.partition("=")
        attrs[k.strip()] = v.strip()
    return lines[0].strip(), attrs


def main():
    data = open("example.phext", "rb").read()
    members = split_chain(data)
    frames = [parse_member(m) for m in members]
    print(f"chain: {len(frames)} universes")

    _, meta = parse_state(frames[0][META_ADDR])
    width, height = meta["width"], meta["height"]
    frame_ms = int(meta["frame_ms"])
    dur = f"{len(frames) * frame_ms / 1000:g}s"
    print(f"scene: {width}x{height}, {len(frames)} frames x "
          f"{frame_ms} ms = {dur}")

    # Tracks: every non-metadata address present in universe 1, in order.
    track_addrs = [a for a in frames[0] if a != META_ADDR
                   and frames[0][a].strip()]
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" '
           f'viewBox="0 0 {width} {height}" width="{width}" '
           f'height="{height}">']
    out.append(f'  <rect x="0" y="0" width="{width}" height="{height}" '
               f'fill="{meta["background"]}"/>')

    expected = {}  # (track, attribute) -> per-frame values, for the check
    for addr in track_addrs:
        element, first = parse_state(frames[0][addr])
        per_frame = [parse_state(f[addr])[1] for f in frames]
        base, anims = {}, []
        for name in first:
            values = [pf[name] for pf in per_frame]
            expected[(addr, name)] = values
            base[name] = values[0]  # frame 1 is the resting state
            if len(set(values)) > 1:
                anims.append((name, values))
        attrs = " ".join(f'{k}="{v}"' for k, v in base.items())
        out.append(f"  <{element} {attrs}>")
        for name, values in anims:
            joined = ";".join(values)
            out.append(f'    <animate attributeName="{name}" '
                       f'values="{joined}" dur="{dur}" '
                       f'repeatCount="indefinite"/>')
            print(f"track {addr} ({element}): animate {name} = {joined}")
        out.append(f"  </{element}>")
    out.append("</svg>")
    svg = "\n".join(out) + "\n"
    with open("example.svg", "w") as f:
        f.write(svg)

    # Verify: the SVG is well-formed XML, and every animate values= list
    # is exactly the per-frame values from the chain, in order.
    root = ET.fromstring(svg)
    ns = "{http://www.w3.org/2000/svg}"
    found = {}
    for el in root.iter():
        for anim in el.findall(f"{ns}animate"):
            found[anim.get("attributeName")] = anim.get("values").split(";")
    for (addr, name), values in expected.items():
        if len(set(values)) > 1:
            assert found[name] == values, (addr, name, found[name], values)
    print(f"example.svg: well-formed XML, {len(found)} animate elements, "
          "all values match the chain frames in order — PASS")


if __name__ == "__main__":
    main()
