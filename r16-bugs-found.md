# R16 Bugs Found — sites-mirrorborn-us

**Audit Date:** 2026-02-07 20:27 CST  
**Auditor:** Cyon 🪶

---

## Critical Bugs (P0)

### 1. Wrong Title on index.html
**File:** index.html  
**Issue:** `<title>Mytheon Arena — AI Coordination via Scrolls</title>`  
**Expected:** `<title>Mirrorborn • Shell of Nine</title>`  
**Impact:** SEO, user confusion (URL is mirrorborn.us, not mytheon arena)

### 2. Wrong OG Tags on index.html  
**File:** index.html  
**Issue:** `<meta property="og:title" content="Mytheon Arena">`  
**Expected:** `<meta property="og:title" content="Mirrorborn • Shell of Nine">`  
**Impact:** Social media sharing shows wrong branding

### 3. External Google Fonts Loading
**Files:** index.html, landing.html  
**Issue:** Loads fonts from fonts.googleapis.com + fonts.gstatic.com  
**Expected:** System fonts or self-hosted fonts  
**Impact:** Privacy (Google tracking), performance (external request), GDPR compliance

---

## High Priority Bugs (P1)

### 4. Missing Social Links on index.html
**File:** index.html  
**Issue:** No visible links to Discord, GitHub, X/Twitter  
**Expected:** Social links in header or hero section  
**Impact:** Users can't find community/code easily

### 5. Missing R16 Version Tag
**Files:** index.html, landing.html, network.html, 404.html, 500.html  
**Issue:** Footer doesn't show R16 version  
**Expected:** Version badge in footer (like arena.html now has)  
**Impact:** Can't track which version is deployed

### 6. Missing "About Us" Link
**Files:** All pages  
**Issue:** No link to phext.io/about-us.html  
**Expected:** Footer link to About page  
**Impact:** Users can't learn who we are

---

## Medium Priority Bugs (P2)

### 7. Inconsistent Discord Links
**Files:** Various  
**Issue:** Some use discord.gg/clawd (old), should use discord.gg/kGCMM5yQ (Mirrorborn) or discord.gg/YCHRq7Ux (Arena)  
**Expected:** Context-appropriate Discord links  
**Impact:** Wrong Discord server for context

### 8. No Mirrorborn GitHub Link
**Files:** All pages  
**Issue:** GitHub link missing or points to wrong repo  
**Expected:** github.com/wbic16 in footer  
**Impact:** Developers can't find code

### 9. No X/Twitter Link
**Files:** All pages  
**Issue:** No link to x.com/wbic16  
**Expected:** Social link in footer  
**Impact:** Users can't follow updates

---

## Low Priority Bugs (P3)

### 10. Inconsistent Footer Styling
**Files:** Various  
**Issue:** Different footer formats across pages  
**Expected:** Unified footer component  
**Impact:** Visual inconsistency

### 11. Missing Favicon Reference
**Files:** Some pages  
**Issue:** favicon.svg exists but not all pages link to it  
**Expected:** All pages should have `<link rel="icon" href="/favicon.svg">`  
**Impact:** Browser tab shows generic icon

---

## Fixes Applied (This Commit)

- [ ] Fix index.html title (Mytheon Arena → Mirrorborn)
- [ ] Fix OG tags on index.html
- [ ] Remove Google Fonts from index.html + landing.html
- [ ] Add system font fallbacks
- [ ] Add social links to index.html hero
- [ ] Add R16 version tag to all pages
- [ ] Add About Us link to footer
- [ ] Standardize Discord links (context-appropriate)
- [ ] Add favicon to all pages

---

**Total bugs found:** 11  
**Total files affected:** 7+  
**Estimated fix time:** 45 min (singularity time)
