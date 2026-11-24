#!/usr/bin/env python3
"""Verify the publishable page — the player now parses the chain live,
in the browser, with libphext-node, so there is no data left to inject.
What this script builds is confidence, and it builds it from evidence:

1. The ORACLE: the chain read by the guide's own Python route
   (split on 0x02, require 0x03, parse_phext per member).
2. The SHIPPED LIBRARY: publish/libphext.umd.js — the exact bundle the
   page serves — loaded in Node the way a browser loads it (global
   branch, no lzmaNative), checked against the oracle: chain shape,
   byte-exact parse/serialize roundtrip, every $N: fetch, the
   reference enumeration, explode/implode, replace() byte-locality,
   and the unclosed-chain signal.
3. The EDITOR'S REPRESENTATION: the codec is extracted from the page
   itself and run in Node — encode(example.phext) then decode must be
   the identical bytes.
4. The SMIL ROUTE: every animate values= list in example.svg equals
   the oracle's per-frame values for that attribute, in order.
5. The PAGE ITSELF: it fetches example.phext, loads libphext.umd.js,
   states the file's true SHA-256, and embeds no frame data.

Any failure exits nonzero. Nothing here modifies the page.
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from generate import split_chain, parse_member, parse_state, META_ADDR  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "publish")
PAGE = os.path.join(PUB, "index.html")
EXAMPLE = os.path.join(HERE, "example.phext")
BUNDLE = os.path.join(PUB, "libphext.umd.js")


def frames_from_chain():
    data = open(EXAMPLE, "rb").read()
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


LIB_HARNESS = r"""
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const [bundlePath, oraclePath, examplePath] = process.argv.slice(2);
const sandbox = {};
sandbox.self = sandbox;
sandbox.TextDecoder = TextDecoder;
sandbox.TextEncoder = TextEncoder;
vm.createContext(sandbox);
vm.runInContext(readFileSync(bundlePath, 'utf-8'), sandbox,
                { filename: 'libphext.umd.js' });
const lib = sandbox.libphext;
if (!lib) { console.error('FAIL: UMD global libphext not set'); process.exit(1); }
const phext = new lib.Phext();
const Coordinate = lib.Coordinate, Chain = lib.Chain;
const oracle = JSON.parse(readFileSync(oraclePath, 'utf-8'));
const bytes = readFileSync(examplePath);
const text = new TextDecoder('utf-8').decode(bytes);
let fail = 0;
const check = (name, cond, extra='') => {
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (cond ? '' : ' — ' + extra));
  if (!cond) fail++;
};
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function parseState(t) {
  const lines = t.split('\n').map(s => s.trim()).filter(s => s.length);
  const attrs = {};
  for (const ln of lines.slice(1)) {
    const i = ln.indexOf('=');
    attrs[ln.slice(0, i).trim()] = ln.slice(i + 1).trim();
  }
  return [lines[0], attrs];
}
const META = '1.1.1/1.1.1/1.1.1';
const chains = phext.parse_chains(text);
check('parse_chains returns exactly 1 chain', chains.length === 1);
const chain = chains[0];
check('chain.closed === true', chain.closed === true);
check('chain has 8 members', chain.members.length === 8);
check('serialize_chains(parse_chains(text)) === text',
      phext.serialize_chains(chains) === text);
let fetchOk = true, detail = '';
const [, metaAttrs] = parseState(chain.fetch('$1:' + META));
if (!eq(metaAttrs, oracle.frames.meta)) { fetchOk = false; detail = 'meta'; }
for (const u of oracle.frames.universes) {
  for (const addr of oracle.frames.tracks) {
    const [el, attrs] = parseState(chain.fetch('$' + u.n + ':' + addr));
    const want = u.scrolls[addr];
    if (el !== want.element || !eq(attrs, want.attrs)) {
      fetchOk = false; detail = `$${u.n}:${addr}`;
    }
  }
}
check('chain.fetch($N:addr) matches oracle everywhere', fetchOk, detail);
const enumMap = {};
for (const s of phext.phokenize_bytes(Buffer.from(chain.members[1], 'utf-8'))) {
  enumMap[s.coord.to_string()] = s.bytes.toString('utf-8');
}
const oracleNE = {};
for (const [k, v] of Object.entries(oracle.members[1])) if (v !== '') oracleNE[k] = v;
check('phokenize_bytes enumerates universe 2 non-empty scrolls exactly',
      eq(enumMap, oracleNE));
check('empty metadata scroll in universe 2 fetches as ""',
      chain.fetch('$2:' + META) === '');
let ei = true;
for (const m of chain.members) if (phext.implode(phext.explode(m)) !== m) ei = false;
check('implode(explode(member)) === member for all members', ei);
const C2 = '1.1.1/1.1.1/1.1.2';
const orig = chain.fetch('$2:' + C2);
const members2 = chain.members.slice();
members2[1] = phext.replace(members2[1], new Coordinate(C2),
                            orig.replace('cx=44', 'cx=45'));
const edited = phext.parse_chains(
  phext.serialize_chains([new Chain(members2, true)]))[0];
let loc = edited.fetch('$2:' + C2) === orig.replace('cx=44', 'cx=45');
for (let n = 1; n <= 8 && loc; n++) {
  for (const addr of [META, ...oracle.frames.tracks]) {
    if (n === 2 && addr === C2) continue;
    if (edited.fetch(`$${n}:${addr}`) !== chain.fetch(`$${n}:${addr}`)) loc = false;
  }
}
check('replace() edit changes only the edited scroll', loc);
const un = phext.parse_chains(text.slice(0, -1));
check('chain without 0x03 parses with closed === false',
      un.length === 1 && un[0].closed === false && un[0].members.length === 8);
process.exit(fail ? 1 : 0);
"""

CODEC_HARNESS = r"""
import { readFileSync } from 'node:fs';
const [codecPath, examplePath] = process.argv.slice(2);
const src = readFileSync(codecPath, 'utf-8');
const repEncode = eval(src + '; repEncode');
const repDecode = eval(src + '; repDecode');
const bytes = new Uint8Array(readFileSync(examplePath));
const rep = repEncode(bytes);
const back = repDecode(rep);
let same = back.length === bytes.length;
for (let i = 0; same && i < bytes.length; i++) if (back[i] !== bytes[i]) same = false;
console.log((same ? 'ok   ' : 'FAIL ') +
  'editor representation roundtrip: decode(encode(example.phext)) ' +
  'is the identical ' + bytes.length + ' bytes');
const nChain = [...rep].filter(c => c === '\u2402').length;
const endsClose = rep.endsWith('\u2403');
console.log(((nChain === 7 && endsClose) ? 'ok   ' : 'FAIL ') +
  `representation shows 7 chain delimiters (found ${nChain}) and ends ` +
  `with the chain close (␃: ${endsClose})`);
process.exit(same && nChain === 7 && endsClose ? 0 : 1);
"""


def run_node(source, args, label):
    with tempfile.NamedTemporaryFile("w", suffix=".mjs",
                                     delete=False) as t:
        t.write(source)
        path = t.name
    try:
        r = subprocess.run(["node", path] + args,
                           capture_output=True, text=True)
        sys.stdout.write(r.stdout)
        if r.returncode != 0:
            sys.stderr.write(r.stderr)
            raise SystemExit(f"{label}: FAILED")
        print(f"{label}: PASS")
    finally:
        os.unlink(path)


def main():
    oracle = frames_from_chain()
    data = open(EXAMPLE, "rb").read()
    members = [parse_member(m) for m in split_chain(data)]
    sha = hashlib.sha256(data).hexdigest()
    html = open(PAGE, encoding="utf-8").read()

    with tempfile.TemporaryDirectory() as td:
        oracle_path = os.path.join(td, "oracle.json")
        json.dump({"frames": oracle, "members": members},
                  open(oracle_path, "w"))
        run_node(LIB_HARNESS, [BUNDLE, oracle_path, EXAMPLE],
                 "shipped libphext bundle vs oracle")

        # The codec is extracted from the page itself — the shipped
        # code is the tested code.
        begin = html.index("/*__CODEC_BEGIN__*/")
        end = html.index("/*__CODEC_END__*/") + len("/*__CODEC_END__*/")
        codec_path = os.path.join(td, "codec.js")
        open(codec_path, "w", encoding="utf-8").write(html[begin:end])
        run_node(CODEC_HARNESS, [codec_path, EXAMPLE],
                 "editor representation codec")

    # SMIL cross-check: every animate values= list in example.svg
    # equals the oracle's per-frame values for that attribute, in order.
    ns = "{http://www.w3.org/2000/svg}"
    root = ET.parse(os.path.join(HERE, "example.svg")).getroot()
    children = [el for el in root if isinstance(el.tag, str)]
    body = children[1:]  # skip the background rect
    assert len(body) == len(oracle["tracks"]), (len(body), oracle["tracks"])
    checked = 0
    for el, addr in zip(body, oracle["tracks"]):
        for anim in el.findall(f"{ns}animate"):
            name = anim.get("attributeName")
            values = anim.get("values").split(";")
            per = [u["scrolls"][addr]["attrs"][name]
                   for u in oracle["universes"]]
            assert per == values, (addr, name, per, values)
            checked += 1
    print(f"oracle vs example.svg: {checked} animate lists agree — PASS")

    # The page itself.
    assert "const FRAMES" not in html, "embedded frame JSON still present"
    assert '"universes"' not in html, "embedded frame JSON still present"
    assert "fetch('example.phext')" in html, "page does not fetch the chain"
    assert '<script src="libphext.umd.js"></script>' in html, \
        "page does not load the library asset"
    assert sha in html, "page does not state the example's true SHA-256"
    bundle_sha = hashlib.sha256(open(BUNDLE, "rb").read()).hexdigest()
    assert bundle_sha in html, "page does not state the library bundle's SHA-256"
    print("page assertions: fetches the chain, loads libphext.umd.js, "
          "states both SHA-256 hashes, embeds no frame data — PASS")
    print(f"example.phext sha256: {sha}")
    print(f"libphext.umd.js sha256: {bundle_sha}")


if __name__ == "__main__":
    main()
