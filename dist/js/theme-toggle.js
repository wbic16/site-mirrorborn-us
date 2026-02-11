// Theme Toggle — Dark Mode by Default
// R17 Enhancement by Cyon 🪶

(function() {
  'use strict';
  
  // Theme storage key
  const THEME_KEY = 'mirrorborn-theme';
  
  // Get saved theme or default to dark
  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'dark';
    } catch (e) {
      return 'dark'; // Fallback if localStorage unavailable
    }
  }
  
  // Save theme preference
  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme preference');
    }
  }
  
  // Apply theme to document
  function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme'); // Dark is default
    }
    
    // Update toggle button if it exists
    updateToggleButton(theme);
  }
  
  // Update toggle button appearance
  function updateToggleButton(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    
    const icon = toggle.querySelector('.theme-toggle-icon');
    const label = toggle.querySelector('.theme-toggle-label');
    
    if (theme === 'light') {
      // Show moon icon (switch to dark mode)
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      if (label) label.textContent = 'Dark';
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      // Show sun icon (switch to light mode)
      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
      if (label) label.textContent = 'Light';
      toggle.setAttribute('aria-label', 'Switch to light mode');
    }
  }
  
  // Toggle between themes
  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  }
  
  // Initialize theme on page load
  function initTheme() {
    // Remove no-transition class after initial load
    document.documentElement.classList.add('no-transition');
    
    const savedTheme = getSavedTheme();
    applyTheme(savedTheme);
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);
    
    // Add toggle button if not present
    if (!document.querySelector('.theme-toggle')) {
      addToggleButton();
    }
    
    // Attach event listeners
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', toggleTheme);
    }
  }
  
  // Add toggle button to page
  function addToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    
    const icon = document.createElement('span');
    icon.className = 'theme-toggle-icon';
    
    const label = document.createElement('span');
    label.className = 'theme-toggle-label';
    
    button.appendChild(icon);
    button.appendChild(label);
    
    document.body.appendChild(button);
  }
  
  // Detect system preference changes
  function watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't set a preference
      const saved = localStorage.getItem(THEME_KEY);
      if (!saved) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
  
  // Watch for system theme changes
  watchSystemTheme();
  
  // Expose toggle function globally (for manual triggering)
  window.toggleTheme = toggleTheme;
  
})();
