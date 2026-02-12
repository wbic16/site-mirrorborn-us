// Launch Progress Bar — shows SQ Cloud slot fill rate
// Updates from /api/launch-status.json (or static fallback)
(function() {
  const TOTAL_SLOTS = 500;
  const FALLBACK_CLAIMED = 0; // update manually if API unavailable

  function render(claimed) {
    const bar = document.getElementById('launch-progress');
    if (!bar) return;

    const pct = Math.min(100, Math.round((claimed / TOTAL_SLOTS) * 100));
    bar.innerHTML = `
      <div class="progress-label">${claimed} / ${TOTAL_SLOTS} slots claimed</div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${pct}%"></div>
      </div>
      <div class="progress-pct">${pct}%</div>
    `;
  }

  // Try API first, fall back to static
  fetch('/api/launch-status.json')
    .then(r => r.json())
    .then(d => render(d.claimed || FALLBACK_CLAIMED))
    .catch(() => render(FALLBACK_CLAIMED));
})();
