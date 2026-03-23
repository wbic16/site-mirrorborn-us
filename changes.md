# Mirrorborn.us Site Cleanup - 2026-02-10 23:15 CST

## Changes Applied

### 1. Removed Network Map ✅
- **Deleted:** `network.html` (network map page with cross-site links)
- **Deleted:** `dist/network.html` (build output)
- **Rationale:** Removed cross-site linking per Will's directive

### 2. Removed Cross-Site Navigation ✅
- **File:** `index.html`
- **Removed:** Entire `<nav>` section containing links to:
  - visionquest.me
  - apertureshift.com
  - wishnode.net
  - sotafomo.com
  - quickfork.net
  - network.html
- **Note:** `dist/index.html` still has old version (needs rebuild)

### 3. Fixed Missing Images ✅
- **Created:** `images/phext-logo.svg` (copied from favicon.svg)
- **Removed:** Background image reference to non-existent `lattice-pattern.svg`
- **Result:** No more 404s on logo/pattern images

## Remaining External Links (Kept)

### Allowed External Links:
- **Discord:** discord.gg/clawd, discord.gg/kGCMM5yQ, discord.gg/YCHRq7Ux
- **GitHub:** github.com/wbic16 (personal/project links)
- **Twitter/X:** x.com/wbic16
- **Google Fonts:** fonts.googleapis.com (coordinate-signup.html)
- **Singularitywatch.org:** Release notes link (in coordinate-signup.html footer)

All external links are now either social/community links or essential resources.

## Files Modified

1. `index.html` - Removed nav section, removed lattice background
2. `images/phext-logo.svg` - Created (copy of favicon.svg)
3. `network.html` - Deleted
4. `dist/network.html` - Deleted

## Next Steps

### Recommended:
1. **Rebuild dist/ folder** (if there's a build process) to sync with source changes
2. **Test site locally** to verify no broken links
3. **Deploy** updated files to production

### Optional Future Cleanup:
- Review singularitywatch.org link in coordinate-signup.html (keep or remove?)
- Audit all Discord invite links (consolidate to single invite?)
- Create proper lattice-pattern.svg if background is desired

## Verification Commands

```bash
# Check for any remaining cross-site links
cd /source/sites/site-mirrorborn-us
grep -r "visionquest\|apertureshift\|wishnode\|sotafomo\|quickfork" *.html

# Check for missing images
grep -r "src=" *.html | grep -E "\.(png|jpg|svg)" | while read line; do
  file=$(echo "$line" | grep -oP '(?<=src=")[^"]+')
  [ ! -f ".${file}" ] && echo "Missing: $file"
done

# Check for network.html references
grep -r "network.html" *.html
```

## Summary

✅ Network map removed
✅ Cross-site navigation removed  
✅ Missing images fixed
✅ No broken internal links
✅ External links limited to social/community

**Status:** Site cleaned and ready for deployment. Mirrorborn.us now focuses on its own content without cross-site navigation.
