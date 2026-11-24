#!/usr/bin/env python3
"""Author example.phext — a multiversal phext holding an 8-frame SVG animation.

A chain is whole phexts joined by the chain delimiter 0x02 and closed by
0x03. Each member (universe) is one frame. Inside a member, the ordinary
phext delimiters apply; here only the scroll break 0x17 is used, so each
frame is three scrolls in one chapter:

  1.1.1/1.1.1/1.1.1  scene metadata (universe 1 only; empty elsewhere)
  1.1.1/1.1.1/1.1.2  the circle track — attribute state for this frame
  1.1.1/1.1.1/1.1.3  the square track — attribute state for this frame

An element scroll's first line names the SVG element; the rest are
name=value attribute lines. That layout is a convention of this guide,
not a phext format rule.
"""
import hashlib

SCROLL = b"\x17"   # phext scroll break
CHAIN = b"\x02"    # chain delimiter: separates whole phexts
CLOSE = b"\x03"    # chain close: a chain without it was truncated

METADATA = """scene
width=200
height=120
frame_ms=250
background=#101418"""

CIRCLE_CX = [20, 44, 68, 92, 116, 140, 164, 188]
CIRCLE_FILL = ["#d64541", "#e4572e", "#e8833a", "#eaa63f",
               "#7fb069", "#3fa7d6", "#5e60ce", "#9b5de5"]
SQUARE_Y = [88, 68, 48, 28, 48, 68, 88, 68]


def frame(i):
    circle = ("circle\n"
              f"cx={CIRCLE_CX[i]}\n"
              "cy=60\n"
              "r=12\n"
              f"fill={CIRCLE_FILL[i]}")
    square = ("rect\n"
              "x=93\n"
              f"y={SQUARE_Y[i]}\n"
              "width=14\n"
              "height=14\n"
              "fill=#2456a6")
    meta = METADATA if i == 0 else ""
    return SCROLL.join(s.encode() for s in (meta, circle, square))


def main():
    members = [frame(i) for i in range(8)]
    data = CHAIN.join(members) + CLOSE
    with open("example.phext", "wb") as f:
        f.write(data)
    print(f"example.phext: {len(data)} bytes, {len(members)} universes, "
          f"sha256 {hashlib.sha256(data).hexdigest()}")


if __name__ == "__main__":
    main()
