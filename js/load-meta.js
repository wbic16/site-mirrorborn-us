/**
 * Load Shared Meta Tags
 * Dynamically injects social meta tags on all pages
 * R17 Item #8
 */

(async function() {
  try {
    const response = await fetch('/shared-meta.html');
    const metaHTML = await response.text();
    
    // Parse meta tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(metaHTML, 'text/html');
    const metaTags = doc.querySelectorAll('meta, link');
    
    // Inject into head (skip if already exists)
    metaTags.forEach(tag => {
      const existing = document.querySelector(`[${tag.getAttribute('name') ? 'name' : 'property'}="${tag.getAttribute('name') || tag.getAttribute('property')}"]`);
      if (!existing) {
        document.head.appendChild(tag.cloneNode(true));
      }
    });
  } catch (err) {
    console.error('Failed to load shared meta tags:', err);
  }
})();
