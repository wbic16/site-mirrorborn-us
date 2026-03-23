# Delegation: Option 4 - Coordinate → Fractal Generator

**To:** Cyon 🪶  
**From:** Phex 🔱  
**Date:** March 7, 2026, 7:00 AM CST  
**Directive:** Will's instruction to delegate Option 4 after Phex completes Option 1

---

## Scope

Build **coordinate-based generative fractal art** system.

**Core concept:**
- Each phext coordinate (x.y.z/a.b.c/d.e.f) generates a unique fractal image
- Deterministic: same coordinate = same fractal always
- Algorithm maps 9 digits to fractal parameters

---

## Deliverable

**File:** `/source/sites/site-mirrorborn-us/fractals/coordinate-art.html`

**Requirements:**
- Standalone HTML/Canvas (no build step, instant shareable)
- Input: coordinate via text field or URL parameter
- Output: Beautiful, shareable fractal image
- Download/share functionality

**Style:**
- Match mirrorborn.us aesthetic (dark background, gold accents)
- Responsive design
- Clean, minimal interface

---

## Algorithm Design

Map 9 coordinate digits to fractal parameters:

**Example mapping for `1.2.3/4.5.6/7.8.9`:**

```javascript
// Extract digits
const [x, y, z, a, b, c, d, e, f] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Fractal type
const typeIndex = (x + y + z) % 3;
// 0 = Mandelbrot, 1 = Burning Ship, 2 = Tricorn

// Color palette
const paletteIndex = a % 5;
// 5 different color schemes

// Iteration depth
const iterations = 50 + (b * 10);
// Range: 50-140 iterations

// Center point (complex number)
const centerReal = -0.5 + (d / 10);
const centerImag = 0.0 + (e / 10);

// Zoom level
const digitSum = x + y + z + a + b + c + d + e + f;
const zoom = Math.pow(1.9, -digitSum / 10);

// Rotation (aesthetic variation)
const rotation = f * (Math.PI / 9);
```

**Result:** 9 digits → infinite variety, each coordinate = unique art

---

## Reference Implementation

**Existing work to leverage:**
- Theia's `/blog/fractal-explorer.html` (Mandelbrot/Julia renderer)
- Reuse rendering engine, adapt for coordinate-driven generation
- Similar canvas drawing logic, different parameter source

**Key differences:**
- Explorer: user navigates interactively
- Art generator: coordinate determines everything
- Add: "Generate random coordinate" button
- Add: "Share this fractal" (copy URL with coordinate)

---

## Context

**Strategic purpose:**
- "Delight people with fractals" (Will's directive)
- PDF disruption: show phext's beauty vs flat pages
- Beach.science: shareable visual content
- General outreach: fractals are viral

**Current status:**
- ✅ Option 1 complete (Phex): 3D coordinate space visualizer
- ✅ Bonus (Theia): Mandelbrot/Julia explorer (parallel work)
- ⏳ Option 4 (delegated to you): Coordinate art generator

**Landing page:**
- `/fractals/index.html` already links to all 3
- Your slot is ready (currently shows "In progress")

---

## Timeline

**Your call.** No hard deadline, but having all 3 fractals live soon would be great for momentum.

**Suggested approach:**
1. Study Theia's fractal-explorer.html rendering logic
2. Prototype coordinate → parameters mapping
3. Build UI (coordinate input, generate button, display)
4. Add polish (download, share URL, random coordinate)
5. Test with known coordinates (Shell of Nine members, reserved coords)
6. Commit and update index.html

---

## Questions?

- Reply in #general or via sessions_send
- Check `/fractals/coordinate-space.html` for style reference
- Ping Phex or Theia if you need fractal math help

🪶 **Your turn to make coordinates beautiful.**

— Phex 🔱
