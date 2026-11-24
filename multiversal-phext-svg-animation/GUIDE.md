# Multiversal Phext for SVG Animation

*A guide to holding an animation as a chain of phexts — one universe per frame — and playing it back as SVG.*

Two kinds of statement live in this guide, and they are kept apart. **Format facts** are how phext chains work, as implemented in libphext 0.6 (Rust) and libphext-node. **Conventions** are choices this guide defines for animation — a scene layout, a way of writing an element's state — labelled as convention wherever they appear. The conventions are the teaching; the facts are the ground they stand on.

Everything claimed here is demonstrated by a worked example you can run: an 8-frame chain, a generator, and the SVG it emits, each step verified at the end of this guide.

> **Correction, 2026-11-23.** The first published version of this guide claimed chain support had shipped in SQ, and presented the worked example as verified end to end. That was wrong, and the demo built on it was withdrawn. The verified position: chains are real in the libraries (libphext-rs 0.6.x, libphext-node) and the example file is a valid chain for them — but **SQ, and Phext Notepad reading through SQ, do not surface chains at all**. SQ v0.6.0 ships libphext 0.3.3, which predates the chain layer; hosted in SQ, the example is one ordinary phext of 17 scrolls, its chain bytes sitting as content inside scrolls, and `$N:` addressing returns empty. The original verification checked the generator, a Python reimplementation, and libphext-node against each other and never against SQ — a closed loop. The full diagnosis is in `DIAGNOSIS.md` beside this guide. Sections 4 and 5 below are amended to match the evidence; nothing in this guide should be read as claiming the example works in SQ or Phext Notepad today.

---

## 1. The model, in one page

A single phext is a body of text arranged in nine dimensions — Library, Shelf, Series, Collection, Volume, Book, Chapter, Section, Scroll — and every scroll has an address, like `1.1.1/1.1.1/1.1.2`. A phext with nothing more is one universe: one state of affairs, held still.

A **chain** is where time enters. Two bytes do the work:

- `0x02` — the **chain delimiter**, one rung above Library. It separates whole phexts.
- `0x03` — the **chain close**. A chain that ends without it was truncated.

A chain is an ordered series of complete phext states. The nine dimensions address space; the chain orders states. Each member of the chain is a **universe**, indexed from 1, and any scroll in any universe can be named: `$3:1.1.1/1.1.1/1.1.2` is the scroll at that address in universe 3. A bare address, with no `$N:` prefix, means universe 1.

Animation falls straight out of this:

| Animation idea | In the chain |
|---|---|
| A frame | One universe — one complete phext |
| An element | One address, held constant across the chain |
| A track | That address read across successive universes: the element's state at each time |
| A timeline | The chain order itself |
| Playback | Walking the chain in order |
| An alternate take | A second chain sharing a prefix — the pathway forks |

That last row carries weight beyond bookkeeping. Pathways between phexts themselves hold information: two chains that agree for five frames and differ at the sixth are saying something a single timeline cannot — *here is where the takes divide*. Branching is not a special feature layered on top; it is what a multiverse is.

So an animated scene is not a file with frames hidden inside a format. It is a small multiverse: every frame a complete, addressable, readable phext, and every element traceable through time by following one address from universe to universe.

---

## 2. Authoring a scene

### 2.1 The layout (convention)

This guide's convention puts three kinds of scroll in every frame. The addresses below are the worked example's; a larger scene grows by the same rule — new elements take new addresses, existing addresses never move.

- **Scene metadata** — `1.1.1/1.1.1/1.1.1`, in universe 1. Canvas width and height, the frame duration, the background. What the whole scene agrees on, stated once, in the first universe.
- **One scroll per element** — `1.1.1/1.1.1/1.1.2`, `1.1.1/1.1.1/1.1.3`, and onward. The same addresses in every universe. Universe 1's scrolls are also the scene's cast list: read the first frame and you know every element the scene will ever have.
- **Empty where absent.** If an element does not exist yet in an early frame, its scroll for that frame is empty. Appearing is a state, not a structural change.

### 2.2 Writing an element's state (convention)

Two forms are available, and the choice is per element, per scene.

**Attribute-state form.** The scroll's first line names the SVG element; the rest are `name=value` lines — the element's attributes at that frame.

```text
circle
cx=44
cy=60
r=12
fill=#e4572e
```

This form is compact, diffable frame to frame, and directly animatable: a column of values down a track *is* an animation curve, one per attribute. It is the form this guide recommends, and the form the worked example proves.

**Full-element form.** The scroll holds the element's complete markup for that frame:

```xml
<circle cx="44" cy="60" r="12" fill="#e4572e"/>
```

This form can do what attribute state cannot — change an element's structure between frames, swap a path's whole geometry, replace one element with another at the same address. Its costs are real: the markup repeats in every frame, diffs are noisier, and no declarative playback route (SMIL, CSS) can consume it — a frame-stepping player must swap the markup in. Reach for it only when a track genuinely changes shape, not merely position or colour.

### 2.3 Authoring by hand, and by script

A chain is bytes: phext members joined by `0x02`, closed by `0x03`. Small chains are written by a small script — the worked example's `make_example.py` is 60 lines and is the honest picture of what authoring looks like today. There is no chain-aware editor yet; that gap is named in §5. What the script buys you is exactness: frames are data in a list, the chain is assembled from them, and a hash of the result is printed so the artifact can be cited precisely.

---

## 3. Playback: three routes

No shipping renderer plays a chain natively. Playback today means a **generator step**: a small program walks the chain and emits something a browser already understands. Three routes, in the order this guide recommends them.

### 3.1 SMIL generation — the proven route

For each track, collect each attribute's values across all frames, in chain order. An attribute that changes becomes a SMIL `<animate>` whose `values=` is that list, joined by semicolons; an attribute that never changes stays a plain attribute on the element. The duration is frames × frame duration, read from the scene metadata.

```xml
<circle cx="20" cy="60" r="12" fill="#d64541">
  <animate attributeName="cx" values="20;44;68;92;116;140;164;188" dur="2s" repeatCount="indefinite"/>
  <animate attributeName="fill" values="#d64541;#e4572e;#e8833a;#eaa63f;#7fb069;#3fa7d6;#5e60ce;#9b5de5" dur="2s" repeatCount="indefinite"/>
</circle>
```

Costs, honestly: SMIL animates attribute values, so it serves the attribute-state form only. Interpolation between frames is the browser's — linear by default, which for position is usually what a chain of keyframes intends. SMIL is deprecated-then-undeprecated in Chrome and supported in all major browsers, but it is the least actively developed of the three routes. Its virtue is that the output is a single self-contained `.svg` file with no script and no stylesheet — the animation as a document, which is very much in the spirit of the format it came from.

### 3.2 CSS keyframes generation

The same per-attribute value lists become `@keyframes` rules: frame *i* of *n* sits at percentage `i/(n−1) × 100`, and each animated property gets its stop values. The generator emits a `<style>` block inside the SVG (or a companion stylesheet), and elements carry `animation` properties.

```css
@keyframes circle-cx {
  0% { cx: 20 } 14.3% { cx: 44 } 28.6% { cx: 68 } /* … */
  100% { cx: 188 }
}
```

Costs: only properties CSS can animate are reachable — geometry properties like `cx` and `cy` are CSS-animatable in modern browsers, `fill` is, but the coverage is a browser matrix, not a guarantee, and it shifts over time. In exchange you get the web's full timing machinery — easing functions, direction, fill modes, composition with the rest of a page's styles. Choose this route when the animation lives inside a larger web page whose styling it should join.

### 3.3 Frame-stepping

A player — a few dozen lines of JavaScript in a page, or Python driving a renderer — holds the chain, and on each tick reads the current universe and applies it: `setAttribute` per attribute for the attribute-state form, or markup replacement for the full-element form. No generation step; the chain is the runtime format.

Costs: a runtime must ship and run wherever the animation plays; nothing about the result is a static document someone can save, inspect, or archive. Its virtues are the mirror of the others' limits: it is the only route that plays the full-element form, the only one that can branch at runtime (choose the next chain at a fork — alternate takes become interactive), and the only one whose timing can answer to anything outside itself. Choose it when the animation is an application, not a picture. The worked example's published page takes this route, with libphext-node as the runtime's parser — see Step 4 in §6.

---

## 4. Tooling, as it stands today

**libphext (Rust, 0.6.x)** is the reference home of chains. It implements `parse_chains` and its inverse `serialize_chains` — byte-exact round-tripping inverses — and `$N:<address>` multiverse addressing. Chain support shipped in libphext 0.6.0. If you are building a player or a generator in Rust, this is the ground floor: parse the chain once, then fetch `$N:` addresses per frame. Note that the chain layer is a text layer in both implementations: `parse_chains` takes a `&str`, so a stream becomes a chain only once its bytes have been accepted as UTF-8 text.

**libphext-node (JavaScript, 0.6.1)** is the same library for Node and the browser: `parse_chains` and `serialize_chains`, `chain.fetch("$N:<address>")` multiverse addressing, `explode`/`implode`, `replace` — the same semantics, pinned by the same chain fixture set (generated by libphext-rs). One caveat, stated in its own build config: the xz seal functions are Node-only, because they bind the native liblzma; everything else bundles for the browser. This is the parser the published page's player and editor run on — the worked example below is parsed live, in the page, by libphext-node, not compiled into it.

**Python, today.** The Python parser on hand, `parse_phext.py`, is a delimiter-walk parser for a *single* phext. Checked against the worked example's chain file, honestly: it does not split chains. Bytes `0x02` and `0x03` are not delimiters to it, so they pass through as content — it reads the 8-universe example as 17 scroll slots of one phext, with the 7 chain delimiters and the close byte sitting inside scroll text. The Python route available today is therefore the one `generate.py` demonstrates: split the bytes on `0x02`, require the closing `0x03`, and hand each member to `parse_phext.py` as an ordinary phext. Twenty lines, stdlib only, and exact — but it is a bridge, and a chain-aware Python reader is owed.

**SQ does not surface chains.** SQ v0.6.0 ships libphext 0.3.3 — two generations before the chain layer — and its hosting model is a single phext per document regardless. Measured against the worked example's actual bytes: SQ hosts the file as one phext of 17 scrolls (`1.1.1/1.1.1/1.1.1` … `1.1.1/1.1.1/1.1.17`), the `0x02` and `0x03` bytes preserved as content inside the scrolls they follow, the scroll counter running straight through the chain breaks; `select` at a `$N:` address returns empty, by CLI and by the REST API alike. Phext Notepad reads through SQ, so it sees the same flat phext. Until SQ gains a chain-aware load and read path, chains live at the library level only — a chain cannot be served, browsed, or addressed through SQ today.

---

## 5. Limits, and when not to use this

- **No native player exists.** Every route in §3 is a generator or a runtime you provide. The chain is the authoring and archival form — the thing that stays readable, diffable, and addressable for decades. The SVG is what today's browsers eat. Keep both; the phext is the source, the SVG is a rendering.
- **Large frame counts.** A universe is a complete phext. A 10,000-frame scene is 10,000 phexts, and every element's full state repeats in every frame whether it moved or not. The model suits keyframed, state-sized scenes — diagrams that move, figures that turn, notation that builds — not video. If your frames are dense raster changes, they are not this.
- **Binary and raster content stays out.** Images, audio, and other binary media do not become scrolls in this model; a scene may *reference* such material by address or URL from a metadata scroll, but the media itself lives elsewhere. Text is the medium; the chain is text all the way down.
- **A single static SVG gains nothing.** If nothing moves, there is one frame, the chain is one universe with a close byte, and you have paid the multiverse for a picture. Use a plain phext, or a plain `.svg`.
- **The tooling gap that matters most: SQ and Phext Notepad do not parse chains** (§4). The worked example is a valid chain for the libraries and a flat 17-scroll phext to the serving and browsing tools. Any workflow that runs through SQ — hosting, sharing, editing in Notepad — will not see the multiverse. This gap does block the worked example's claim to work in the real tooling, and it is the reason the published demo was withdrawn on 2026-11-23.
- **Tooling gaps, named.** No chain-aware editor; no chain-aware Python reader (the split-and-parse bridge stands in); SMIL's browser future is maintained but not growing. All of them bound what "ready" means today.

---

## 6. The worked example, step by step

Everything above, done once, small enough to hold in view. Files: `make_example.py` (authors the chain), `example.phext` (the chain), `generate.py` (chain → SVG), `example.svg` (the animation), `build_page.py` (verifies the published page), and the published page itself (live player and editor, Step 4).

**The scene.** A circle crosses a 200×120 canvas left to right over 8 frames, changing colour as it goes; a square bounces beneath it. Frame duration 250 ms; the whole loop is 2 seconds.

**Step 1 — author the chain.**

```bash
python3 make_example.py
# example.phext: 742 bytes, 8 universes, sha256 62e8881e3a3444cd2673b668640bc09cd8a543d6beedaea5089c957565dc7652
```

The script assembles each frame as three scrolls joined by the scroll break `0x17` — metadata at `1.1.1/1.1.1/1.1.1` (universe 1 only), the circle track at `1.1.1/1.1.1/1.1.2`, the square track at `1.1.1/1.1.1/1.1.3` — then joins the 8 frames with `0x02` and closes with `0x03`. The circle's track, read down the chain, is:

| Universe | `$N:1.1.1/1.1.1/1.1.2` — cx | fill |
|---|---|---|
| 1 | 20 | #d64541 |
| 2 | 44 | #e4572e |
| 3 | 68 | #e8833a |
| 4 | 92 | #eaa63f |
| 5 | 116 | #7fb069 |
| 6 | 140 | #3fa7d6 |
| 7 | 164 | #5e60ce |
| 8 | 188 | #9b5de5 |

**Step 2 — generate the SVG.**

```bash
python3 generate.py
```

The generator splits the chain, parses each universe, reads the scene metadata from `$1:1.1.1/1.1.1/1.1.1`, and walks each track. Its own report:

```text
chain: 8 universes
scene: 200x120, 8 frames x 250 ms = 2s
track 1.1.1/1.1.1/1.1.2 (circle): animate cx = 20;44;68;92;116;140;164;188
track 1.1.1/1.1.1/1.1.2 (circle): animate fill = #d64541;#e4572e;#e8833a;#eaa63f;#7fb069;#3fa7d6;#5e60ce;#9b5de5
track 1.1.1/1.1.1/1.1.3 (rect): animate y = 88;68;48;28;48;68;88;68
example.svg: well-formed XML, 3 animate elements, all values match the chain frames in order — PASS
```

**Step 3 — the result.** `example.svg` is a complete, self-contained animated SVG. Open it in any browser: the circle crosses and changes colour, the square bounces, the loop repeats every 2 seconds. No script, no stylesheet, nothing served.

**Step 4 — play it live, and edit it.** *(Withdrawn 2026-11-23: the published page now carries a withdrawal notice instead of this player. The player described below did run — at the library level, as described — but it was presented as demonstrating the format in the real tooling, which it did not; see the correction at the head of this guide and `DIAGNOSIS.md`.)* The published page (mirrorborn.us/multiversal-phext-svg-animation) carried the other route. Its player fetches `example.phext`, parses it in the browser with libphext-node v0.6.1 (served with the page as `libphext.umd.js`), and renders each frame from `chain.fetch("$N:address")` — no frame data is embedded in the page, and the SHA-256 of the fetched bytes is computed in-page so a visitor can check them against Step 1's hash. Below the player, an editor holds the same data two ways: a structured view (the parse rendered as universes and address-labelled scrolls, the chain close as the end marker) and a raw view (the stream as text, delimiter bytes written as control pictures — ␂ for 0x02, ␃ for 0x03, ␗ for 0x17 — in a representation that re-encodes to the identical bytes). Edit either view and the player re-renders from your bytes; break the chain and it says so by name. It is a demo-sized editor — delimiter awareness, natural rendering, faithful roundtrip — not a phext authoring environment.

**Verification, stated plainly — including its blind spot.** The checks were run, not asserted: the chain parses as exactly 8 universes with the intended per-frame scrolls; the emitted SVG parses as well-formed XML; and every `<animate>` `values=` list was compared against the chain's per-frame values, in order, by the generator itself — all matched. For the live player: the shipped `libphext.umd.js` bundle, loaded the way a browser loads it, was run against the chain in Node — `parse_chains`/`serialize_chains` round-trip the file byte for byte, every `$N:` fetch matches the generator's own parse, `replace` edits are byte-local, and the library's own test suite passes 32,554 assertions. The editor's raw representation round-trips: encode-then-decode of `example.phext` is the identical 742 bytes. What none of this touched: SQ and Phext Notepad. The generator, the Python oracle behind it, and libphext-node all implement the same chain semantics, so their agreement was guaranteed by construction; the first check against the real serving tooling happened when a reader opened the file in Phext Notepad and found one flat phext. Library-level verification is real, and it is not tooling-level verification — this guide's first edition conflated them, and the correction notice at its head records the result. The example is 742 bytes of phext producing 637 bytes of SVG: the multiverse costs about a hundred bytes over its own rendering, and unlike the rendering, it can be re-rendered differently — as CSS, as a stepped player, as a diagram of its own tracks — without being re-authored.

That is the whole method. Frames are universes. Elements are addresses. Time is the chain. Everything else is playback.
