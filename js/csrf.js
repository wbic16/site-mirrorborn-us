/**
 * Bug #7 Fix: CSRF Protection Client Helper
 * 
 * Automatically includes CSRF token in all fetch requests
 * Usage: import this script, then use fetch() normally
 */

(function() {
  'use strict';
  
  // Get CSRF token from cookie
  function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf_token') {
        return value;
      }
    }
    return null;
  }
  
  // Fetch CSRF token from server if not present
  async function ensureCsrfToken() {
    let token = getCsrfToken();
    if (!token) {
      try {
        const response = await window._originalFetch('/api/csrf-token');
        const data = await response.json();
        token = data.csrfToken;
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    }
    return token;
  }
  
  // Store original fetch
  window._originalFetch = window.fetch;
  
  // Override fetch to include CSRF token
  window.fetch = async function(url, options = {}) {
    // Only add CSRF for same-origin requests
    if (typeof url === 'string' && !url.startsWith('http')) {
      const method = options.method || 'GET';
      
      // Add CSRF token for state-changing requests
      if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
        const token = await ensureCsrfToken();
        if (token) {
          options.headers = options.headers || {};
          options.headers['X-CSRF-Token'] = token;
        }
      }
    }
    
    return window._originalFetch(url, options);
  };
  
})();
