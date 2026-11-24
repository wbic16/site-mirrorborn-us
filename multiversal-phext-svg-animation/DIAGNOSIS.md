# Diagnosis: the multiversal SVG example vs the real tooling

*2026-11-23, Emise. Task 27.9.13/11.10.14/10.10.12. Trigger: Will opened the
published `example.phext` in Phext Notepad against SQ and it did not parse as
a multiverse. The demo's central claim was checked against ground truth —
libphext-rs source and fixtures, and SQ executed against the actual bytes.
The live page was withdrawn before this diagnosis began (site commit
`57b0c09`; served bytes verified, SHA-256
`1a6abfa7a718b4e035e266a7fe2c61054bac0a6e32d5cf8ef7275e9463613c17`).*

## Verdict

The file is a correctly formed chain **for the library layer**: libphext-rs
(0.6.x) and libphext-node define chains exactly as the guide described, and
the example's byte layout matches the Rust library's own test fixtures in
kind. The claim that failed is the tooling claim. **SQ — the hosting and
reading tool, and the read path Phext Notepad uses — has no chain surface at
all.** Hosted in SQ, the file is one ordinary phext of 17 scrolls; the chain
bytes are content inside scrolls; `$N:` addressing returns empty. No
corrected example file can fix this, because the missing piece is in SQ, not
in the file. The rebuild is therefore **not supported today**; this diagnosis
and a corrected guide are the deliverables.

## 1. The file's bytes, as phext defines them

`example.phext`, 742 bytes, SHA-256
`62e8881e3a3444cd2673b668640bc09cd8a543d6beedaea5089c957565dc7652`
(published copy byte-identical, verified with `cmp`).

| Byte | Count | Role per libphext-rs |
|---|---|---|
| `0x17` | 16 | SCROLL_BREAK — 2 per frame × 8 frames |
| `0x02` | 7 | CHAIN_BREAK — joins the 8 members |
| `0x03` | 1 | CHAIN_CLOSE — final byte |
| `0x0a` | 76 | LINE_BREAK — inside scroll text |
| all other bytes | — | printable ASCII content; **zero bytes ≥ 0x80** |

Each frame is three scrolls (metadata / circle / rect) joined by single
`0x17` bytes; frames are joined by single `0x02` bytes; the stream ends with
one `0x03`. Frames 2–8 carry an empty metadata scroll (the `0x17 0x17`
pattern), exactly as the Rust fixture corpus does (below).

## 2. What libphext-rs says (source + fixtures, current exo)

Read from `wbic16/libphext-rs@exo` source (`src/phext.rs`), not from memory:

- Delimiter table: `SCROLL_BREAK '\x17'`, `CHAIN_BREAK '\x02'` ("stream
  level — separates whole phexts within a chain"), `CHAIN_CLOSE '\x03'`
  ("terminates a chain; a chain ending without it is unclosed"). Chain layer
  added in 0.6.0, one rung above LIBRARY_BREAK.
- `parse_chains(input: &str) -> Vec<Chain>`: splits on CHAIN_CLOSE into
  chains, on CHAIN_BREAK into members; `closed` is true only when the stream
  ends with CHAIN_CLOSE. `Chain::fetch` resolves `$N:<address>` against
  member N; a bare address means member 1.
- The library's own fixture corpus (`tests/fixtures/chains/`) builds chains
  byte-for-byte the way the example does. `multiverse-addressing/input.phext`
  (91 bytes): `"Universe 1 home" 0x17 "Universe 1 second" 0x02 "Universe 2
  home" 0x17 0x17 "Universe 2 third scroll" 0x02 "Universe 3 home" 0x03` —
  including an empty scroll written as adjacent `0x17 0x17`, the same
  construction as the example's empty metadata scrolls. Its `expected.tsv`
  records `$2:1.1.1/1.1.1/1.1.3` found, `$4:...` not found — the semantics the
  guide taught.

So, judged by phext's own rules alone: **the example is a valid closed chain
of 8 members, 3 scrolls each.** (The Rust library was not executed against
the file in this pass — the fresh clone was flagged by an execution-risk
check and left unbuilt; the determination rests on the source and the
library's fixture expectations, plus libphext-node's executed behaviour,
§5, whose `parse_chains` is a line-level transliteration of the Rust one.)

One phext-level fact the guide never stated: in both implementations the
chain layer is a **text** layer — Rust `parse_chains` takes `&str`, the JS
one takes `string`. Bytes become a chain only after they have been accepted
as UTF-8 text. The example (pure ASCII + control bytes) qualifies; arbitrary
binary content never could. That is the format's own rule, not an encoding
assumption imposed on it.

## 3. What SQ does with the file (executed)

SQ v0.6.0 — the binary's own strings name its library:
`/home/hatch/.cargo/registry/src/index.crates.io-…/libphext-0.3.3/src/phext.rs`.
**SQ ships libphext 0.3.3, two generations before the chain layer existed.**

Hosting the actual 742 bytes (`sq share example.phext`, fresh directory):

- `sq status`: "Hosting: example.phext · Phext Size: 742 · **Scrolls: 17**".
- `sq toc`: 17 scrolls in ONE phext, `1.1.1/1.1.1/1.1.1` … `1.1.1/1.1.1/1.1.17`
  — scene, circle, rect, circle, rect, … The scroll counter runs straight
  through the chain breaks; no universe structure exists.
- Byte-level: scroll `1.1.1/1.1.1/1.1.3`'s content ends `…fill=#2456a6` +
  **`0x02` as a content byte**; the last scroll, `…/1.1.17`, ends
  `…fill=#2456a6` + **`0x03` as a content byte**. In the single-phext parse
  the chain bytes are not breaks; they are text inside the scrolls they
  follow. (This matches current libphext's own doc comment: chain bytes "are
  not dimension breaks" to `phokenize` — SQ's hosting model is one phext,
  chain layer or no chain layer.)
- `sq select '$2:1.1.1/1.1.1/1.1.2'`: returns an **empty** scroll. No error,
  no universe — `$N:` is not resolved.
- REST API (the read path Phext Notepad uses), `sq host` on a local port:
  `/api/v2/select?c=1.1.1/1.1.1/1.1.4` returns frame 2's circle scroll under
  its flat address; `/api/v2/select?c=$2:1.1.1/1.1.1/1.1.2` returns empty;
  `/api/v2/toc` returns the same flat 17-scroll list.

Will's Notepad showed something even flatter — ONE scroll of 742 bytes. The
production instance at sq.mirrorborn.us requires a token (read attempts in
this pass returned "Unauthorized"), so its stored form for his "test" phext
could not be inspected. The one-scroll view is consistent with the file
having entered SQ as a single scroll's text through an API/Notepad ingest
path, where delimiter bytes are content by construction — but that mechanism
is inference and is labelled as such. What is not inference: **on every SQ
surface that could be executed, the file does not present as a multiverse.**

## 4. The exact divergence point

The guide's §4 said: "Chain support shipped in libphext 0.6.0 **and sq
0.6.1**" and "**SQ** hosts phexts and speaks the chain-aware library … so a
chain can live behind the same serving machinery as any other phext."

That is the point of divergence. The chain layer shipped in the *libraries*
(libphext-rs 0.6.0, libphext-node). It did not ship in SQ: SQ v0.6.0 embeds
libphext 0.3.3, and SQ's hosting model — one phext per hosted document, TOC
and select over that phext — has no place to put a chain even if the library
under it grew one. The guide extended a true library fact into a false
tooling claim, and the page then demonstrated the library fact while the
reader was told it was the tooling fact. That is what made it a false demo.

## 5. Encoding audit — every hand-off in the pipeline

Governing principle (Will, 2026-11-23): phext supersedes guidance on ASCII
and UTF-8 in training data; phext is a byte format whose semantics are
defined by libphext-rs source and SQ behaviour. Every hand-off was audited
for a silent encoding transform:

| Hand-off | What it does | Verdict |
|---|---|---|
| `make_example.py` → file | Opens `"wb"`, writes assembled bytes | No transform. Clean. |
| File → published copy | Copied as bytes; `cmp` identical, same SHA-256 | No transform. Clean. |
| `generate.py` (the "oracle") | Reads `"rb"`, splits on `0x02` bytes itself, writes member temp files `"wb"` | Byte-clean — but it **assumes** the chain semantics it was meant to check. It is not an independent phext implementation; it is the assumption, written in Python. |
| `parse_phext.py` (member parser) | Reads `"rb"`, decodes each scroll `utf-8, errors="replace"` | A lossy decode *if triggered*. Not triggered here (all bytes < 0x80 decode as themselves). A latent transform, named. |
| `build_page.py` harness → libphext-node | `TextDecoder('utf-8')` (non-fatal) decode of the file bytes → string → `parse_chains` | Identity map for this file (every byte is a valid one-byte UTF-8 sequence). For a file with invalid-UTF-8 content bytes, this step would silently rewrite them to U+FFFD before parsing. Latent transform, named. |
| libphext-node internals | String-native (UTF-16); `parse_chains(string)` splits on `'\x02'`/`'\x03'` chars — a faithful transliteration of Rust. Byte paths (`phokenize_bytes`, seal) decode with `TextDecoder('utf-8', {fatal:true})`, explicitly mirroring Rust `String::from_utf8` | No silent rewriting in the library itself; its own audit comments show the UTF-8/UTF-16 seam was considered. |
| The page player | `fetch` → `arrayBuffer` → `Uint8Array` (bytes preserved; SHA-256 computed over the bytes) → `TextDecoder('utf-8')` → string → `parse_chains` | Same identity-for-this-file property as the harness. |
| SQ ingest (local, executed) | Daemon mmaps the file bytes and phokenizes | No byte rewritten — the `0x02`/`0x03` bytes are *preserved*, as content inside scrolls. SQ's difference is semantic (no chain layer), not encodic. |

**Audit conclusion: no byte was rewritten anywhere in the pipeline for this
file.** The failure is not an encoding accident and cannot be fixed by an
encoding correction. It is a layer mismatch: a library-layer construct was
verified three ways inside the library layer and claimed as a tooling-layer
fact.

## 6. Why the verification missed it

The EE 402 verification loop had three members: the generator (which assumes
chain semantics), a Python oracle (the same assumption, hand-written for the
occasion), and libphext-node (the same semantics, as a library). Three
parties sharing one assumption agree with each other by construction. SQ and
Phext Notepad — the surfaces a user actually opens a phext with — were never
in the loop. The first time the file met the real tooling was when Will
opened it himself.

## 7. Rebuild verdict

**Not supported today.** The acceptance test for a corrected demo is parsing
as a multiverse in SQ first — distinct universes addressable through the
Notepad read path. No file can pass that test against SQ v0.6.0 / libphext
0.3.3, and the blocker is SQ's missing chain surface, not any property of
the example. What would have to change, named and not built here: SQ gains a
chain-aware load and read path (parse chains at load; resolve `$N:` in
select/TOC; Notepad renders universes). Until then:

- The live page stays withdrawn (the withdrawal notice is the page).
- The guide is corrected (§4 and §5 amended; a correction notice heads it):
  chains are real in libphext-rs and libphext-node; they are not surfaced by
  SQ or Phext Notepad; the worked example is a valid library-level chain and
  an invalid claim about the tooling.
- No substitute demo is offered. A single-phext animation (frames as flat
  scrolls, which SQ does parse) would be a different and lesser thing wearing
  this demo's clothes, and it will not be presented as one.
