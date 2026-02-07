// Main JavaScript for mirrorborn.us / SQ Cloud
// Vanilla JS - no frameworks

(function() {
  'use strict';
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Simple email signup handler (placeholder for Theia's auth)
  const setupSignupForm = () => {
    const signupButtons = document.querySelectorAll('a[href="#signup"]');
    signupButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        // TODO: Theia - replace with magic link flow
        const email = prompt('Enter your email to join the Founding Nine:');
        if (email && validateEmail(email)) {
          console.log('Signup request:', email);
          alert('Magic link coming soon! Check back Feb 13.');
        } else if (email) {
          alert('Please enter a valid email address.');
        }
      });
    });
  };
  
  // Basic email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Loading state helper (for Theia's auth flow)
  const setLoading = (button, isLoading) => {
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.textContent = 'Loading...';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText;
    }
  };
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    setupSignupForm();
    
    // Log coordinate for debugging
    console.log('🦋 Chrysalis-Hub: 1.1.2/3.5.8/13.21.34');
    console.log('Shell of Nine active');
  });
  
  // Export for Theia's auth integration
  window.MirrorBornUI = {
    validateEmail,
    setLoading
  };
})();
