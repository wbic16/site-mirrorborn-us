# mirrorborn.us Cleanup Status
**Updated:** 2026-02-11 05:11 UTC

## ✅ Completed

### Network Removal
- [x] Deleted `network.html` (entire network map page)
- [x] Deleted `domains.json` (cross-site config)
- [x] Simplified `components/ecosystem-footer.html` (mirrorborn-only, removed 6 cross-site properties)
- [x] Simplified `components/ecosystem-nav.html` (replaced 6-site nav with simple mirrorborn menu)
- [x] Updated 10 HTML files with cleaned components

### Git Commit
- [x] Commit `ec3bd63`: "Remove network map + cross-site linking"
- [x] 10 files changed, 319 insertions(+), 414 deletions(-)
- [x] Ready for push (awaiting Will's manual push to GitHub)

## ⏳ Remaining Work

### Missing Pages (Referenced but don't exist)
1. ❌ `/about-us.html` — linked from index, footer
2. ❌ `/sq-pro.html` — linked from pricing page
3. ❌ `/reading-lists.html` — linked from index

**Options:**
- A) Create stub pages with "Coming Soon"
- B) Remove links entirely
- C) Redirect to existing pages (about-us → index#about, sq-pro → pricing)

### Missing Assets
1. ❌ `/images/phext-logo.svg` — referenced in HTML but file doesn't exist

**Options:**
- A) Copy from another repo if exists
- B) Replace with text logo
- C) Remove `<img>` tag entirely

### Dead Link Audit
Files still need manual review for internal broken links:
- `coordinate-signup.html` (may still reference domains.json)
- `onboarding/*.html` (check for cross-site onboarding flows)
- `profiles/*.html` (check for network references)

## Next Steps

### Priority 1: Fix Missing Links
```bash
# Quick fix: create stub pages
cd /sites/web/mirrorborn.us
cat > about-us.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>About Us - Mirrorborn</title></head>
<body>
  <h1>About Mirrorborn</h1>
  <p>Coming soon. Return to <a href="/">home</a>.</p>
</body>
</html>
EOF

# Repeat for sq-pro.html, reading-lists.html
```

### Priority 2: Asset Check
```bash
# Find and fix phext-logo.svg reference
grep -r "phext-logo" /sites/web/mirrorborn.us/
# Replace or remove
```

### Priority 3: Full Link Audit
```bash
# Check all links
cd /sites/web/mirrorborn.us
# Run link checker or manual review
```

## Deployment
Once cleanup complete:
```bash
cd /source/site-mirrorborn-us
# Will executes:
git push origin exo
```

Then sync to live:
```bash
rsync -av /source/site-mirrorborn-us/ /sites/web/mirrorborn.us/
```
