# Product Claims Audit - Under-Promise, Over-Deliver

**Context:** Will wants to ensure we're not overpromising features we can't back up.

## Current Claims Analysis

### ❌ OVERPROMISING - Need to Fix

**Hero Section:**
- "Build AI collectives on phext" → Not proven at customer scale
- "Explore coordination in Mytheon Arena" → Arena doesn't exist yet
- "Your agents remember across sessions" → Requires customer integration work
- "Your teams coordinate across machines" → Not demonstrated beyond Mirrorborn internal use

**SQ Cloud Product Card:**
- "Build AI agents that remember across context windows" → Vision, not current capability
- "For: Developers, AI collectives, research labs, multi-agent systems" → Overreach (no customer deployments)

**Mytheon Arena Product Card:**
- All claims are future-tense (fine, it says "Coming Soon")
- But hero references it like it exists now

**Features Section:**
- "Your AI agents need to remember" → Assumes customer use case
- "Multiple agents? Multiple machines?" → Not demonstrated at customer scale

---

### ✅ ACCURATE - Can Keep

**What Actually Works:**
- SQ has REST API (true)
- SQ stores phext (true)
- 11-dimensional coordinate addressing (true)
- Immutable WAL history (true)
- Mirrorborn instances coordinate via SQ daily (true - internal use)
- Phext format itself (true, well-defined)

---

## Recommended Changes

### Hero Section
**Current:**
> "Build AI collectives on phext. Explore coordination in Mytheon Arena."

**Proposed:**
> "Persistent storage for 11-dimensional text. Early alpha."

**Current:**
> "Persistent memory infrastructure for AI agents and collectives. Your agents remember across sessions. Your teams coordinate across machines. The substrate persists."

**Proposed:**
> "REST API for storing and retrieving phext—plain text extended to 11 dimensions. Coordinate-addressed, immutable, persistent. The substrate for future AI coordination."

---

### SQ Cloud Product Card
**Current:**
> "REST API for persistent phext storage. Build AI agents that remember across context windows. 11-dimensional coordinate addressing. Immutable WAL history."

**Proposed:**
> "REST API for phext storage. 11-dimensional coordinate addressing. Immutable WAL history. Store structured text at any coordinate, retrieve it later. Built for AI memory, but works for any text data."

**Current:**
> "For: Developers, AI collectives, research labs, multi-agent systems"

**Proposed:**
> "For: Developers building on structured text, early adopters experimenting with AI memory"

---

### Mytheon Arena Product Card
**Keep as-is** (already says "Coming Soon")

But **remove** from hero subhead since it doesn't exist yet.

---

### Features Section - "Persistent Memory"
**Current:**
> "Your AI agents need to remember across sessions. SQ Cloud stores phext—plain text extended to 11 dimensions. No embeddings. No schemas. Just structured text they can read and write."

**Proposed:**
> "Store text at any 11D coordinate. Retrieve it later. No embeddings. No schemas. Just plain text with structure. What you build on top is up to you."

---

### Features Section - "Coordination Substrate"
**Current:**
> "Multiple agents? Multiple machines? Mytheon Arena is the space where they engage via scrolls—coordinate-addressed content in a navigable lattice."

**Proposed:**
> "Coordinate addressing enables structured navigation. Read/write text at any point in 11D space. The Mirrorborn instances use this for daily coordination—you can too."

---

### Features Section - "Proof It Works"
**Keep as-is** - This is accurate (internal Mirrorborn use is real).

---

## Summary of Tone Shift

**From:** "Build AI collectives! Multi-agent systems! Your agents remember!"
**To:** "Here's what SQ does. Here's how we use it. You can experiment too."

**From:** Selling a vision of AGI coordination
**To:** Offering infrastructure early adopters can build on

**From:** Marketing future capabilities as present
**To:** Describing current capabilities, hinting at future

---

## Implementation Priority

1. **Hero** - Most visible, biggest impact
2. **Product cards** - Direct feature claims
3. **Features section** - Supporting detail
4. **Pricing tiers** - Make sure claims match reality

---

**Recommendation:** Make these changes before launch. Better to be conservative and pleasantly surprise customers than to overpromise and disappoint.
