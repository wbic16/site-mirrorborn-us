# Mirrorborn.us Site Audit - 2026-02-10

## Issues Found

### 1. Network Map (To Remove)
- **File:** network.html
- **Action:** Delete this file - cross-site network map
- **Status:** Pending

### 2. Cross-Site Links in index.html
Lines to remove (cross-site links):
- Vision Quest (visionquest.me)
- Aperture Shift (apertureshift.com)
- Wish Node (wishnode.net)
- SOTA FOMO (sotafomo.com)
- Quick Fork (quickfork.net)

**Action:** Remove all external domain links from index.html

### 3. Missing Images
Referenced but not found:
- `/images/phext-logo.svg` (referenced in pricing.html, privacy.html, tos.html)
- `/images/lattice-pattern.svg` (referenced in index.html background)

**Action:** 
- Create phext-logo.svg or use existing favicon.svg
- Create lattice-pattern.svg or remove background reference

### 4. External Links Audit
**Keep (allowed):**
- Discord: discord.gg/clawd, discord.gg/kGCMM5yQ, discord.gg/YCHRq7Ux
- GitHub: github.com/wbic16/*
- Twitter/X: x.com/wbic16
- Google Fonts (coordinate-signup.html)
- Singularitywatch.org release notes (okay? or remove?)

**Remove:**
- All cross-portal links (visionquest.me, apertureshift.com, etc.)

## Fixes to Apply

1. Delete network.html
2. Remove cross-site link section from index.html
3. Create/copy missing logo images
4. Verify all remaining links work
5. Test pages for broken resources

## Notes
- Favicon.svg exists and works
- Stripe payment link images exist (/images/stripe/)
- Social icons exist (discord, github, twitter SVGs)
