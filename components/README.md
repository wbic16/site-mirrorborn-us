# Ecosystem Navigation Components

**Purpose:** Create a navigable network across all Mirrorborn properties.

**Files:**
- `ecosystem-nav.html` — Top navigation bar (all 6 properties)
- `ecosystem-footer.html` — Footer with links + resources

---

## Usage

### Option 1: Server-Side Include (Recommended)
```html
<!DOCTYPE html>
<html>
<head>...</head>
<body>
    <?php include 'components/ecosystem-nav.html'; ?>
    
    <!-- Your page content -->
    
    <?php include 'components/ecosystem-footer.html'; ?>
</body>
</html>
```

### Option 2: Client-Side Include (JavaScript)
```html
<div id="ecosystem-nav"></div>
<!-- Your content -->
<div id="ecosystem-footer"></div>

<script>
fetch('/components/ecosystem-nav.html')
    .then(r => r.text())
    .then(html => document.getElementById('ecosystem-nav').innerHTML = html);
    
fetch('/components/ecosystem-footer.html')
    .then(r => r.text())
    .then(html => document.getElementById('ecosystem-footer').innerHTML = html);
</script>
```

### Option 3: Copy-Paste (Static Sites)
Copy the HTML + CSS + JS from each component directly into your page.

---

## Navigation Structure

**6 Properties:**
1. **mirrorborn.us** (🦋) — SQ Cloud + Mytheon Arena
2. **visionquest.me** (🔮) — Personal Exocortex
3. **wishnode.net** (🌐) — Always-On Agents
4. **apertureshift.com** (👁️) — Perspective Tools
5. **sotafomo.com** (📡) — AI Trends
6. **quickfork.net** (🍴) — Idea Branching

**Navigation highlights the current site automatically.**

---

## Styling

Both components use the Nord color palette from `css/sq-cloud.css`:
- Background: `#2E3440` (Deep Slate)
- Text: `#D8DEE9` (Soft Cloud)
- Accent: `#88C0D0` (Ice Blue)
- Each property has a unique border color

**Responsive:** Collapses gracefully on mobile.

---

## Testing Cross-Links

**From mirrorborn.us:**
- Click "VisionQuest" → lands on visionquest.me
- Nav shows current site highlighted
- Footer links back to mirrorborn.us

**From any property:**
- Top nav provides quick access to all 6 properties
- Footer includes resources (docs, GitHub, Discord)

---

## Deployment

**Verse:** Copy `components/` directory to each domain:
- mirrorborn.us/components/
- visionquest.me/components/
- wishnode.net/components/
- apertureshift.com/components/
- sotafomo.com/components/
- quickfork.net/components/

Then include in each site's HTML.

---

✴️ Lumen | 2.1.3/4.7.11/18.29.47
