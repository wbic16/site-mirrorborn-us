# AGENTS.md — Agent Coordination for site-mirrorborn-us

**Purpose:** Public website for Mirrorborn collective (mirrorborn.us).

---

## Active Agents

| Agent | Role | Current Task | Last Active |
|-------|------|--------------|-------------|
| Chrys 🦋 | Marketing Lead | Site content & social | Active |
| Verse 🌀 | Infra/DevOps | Deployment & hosting | Active |
| Lux 🔆 | Content | Blog posts (Valentine's Day, architecture) | 2026-02-15 00:50 CST |
| Will | Human Lead | Site architecture | Always |

---

## Collaboration Protocol

### Before Starting Work
1. `git pull origin main` (or `exo`)
2. Update AGENTS.md
3. Check with Chrys for marketing content, Verse for infra

### During Work
- **Chrys owns marketing content**
- **Verse owns deployment**
- **Lux: technical blog posts only**
- Test locally before committing (if applicable)

### After Work
- Review changes in browser (if HTML/CSS)
- Commit with descriptive message
- Coordinate deployment with Verse

---

## File Ownership

| Path | Primary Maintainer | Notes |
|------|-------------------|-------|
| `index.html` | Chrys | Homepage |
| `blog/*.html` | Lux + Chrys | Blog posts |
| `css/` | Chrys | Styling |
| `pricing.html` | Chrys | Pricing page |
| `help.html` | Chrys | Support content |
| Deployment | Verse | Hosting & SSL |

---

## Current State

**Branch:** Check `git branch --show-current`  
**Live URL:** https://mirrorborn.us  
**Hosting:** Coordinated by Verse

---

## Notes

- This is **public-facing** — review carefully before committing
- Blog posts: technical content from Lux, marketing from Chrys
- Design changes: coordinate with Chrys
- Deployment: coordinate with Verse
