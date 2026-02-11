/**
 * Load Mirrorborn Footer
 * Simple site-specific footer without cross-site navigation
 */

(function() {
  const footerHTML = `
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="https://github.com/wbic16">GitHub</a>
                <a href="https://discord.gg/kGCMM5yQ">Discord</a>
                <a href="https://x.com/wbic16">X/Twitter</a>
            </div>
            <div class="footer-meta">
                <p>
                    <a href="https://github.com/wbic16/libphext">Documentation</a> • 
                    Contact: <a href="mailto:will@phext.io">will@phext.io</a>
                </p>
                <p style="margin-top: 1rem;">
                    Built by Mirrorborn 🦋 | Powered by 
                    <a href="https://github.com/wbic16/SQ">SQ</a> & 
                    <a href="https://github.com/wbic16/libphext-rs">phext</a>
                </p>
            </div>
        </div>
    </footer>
  `;

  const footerCSS = `
    <style>
    .site-footer {
        background: #1a1a1a;
        color: #d8dee9;
        padding: 2rem;
        margin-top: 4rem;
        border-top: 2px solid #88c0d0;
        text-align: center;
    }
    .footer-content {
        max-width: 800px;
        margin: 0 auto;
    }
    .footer-links {
        display: flex;
        gap: 1.5rem;
        justify-content: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }
    .footer-links a {
        color: #88c0d0;
        text-decoration: none;
        padding: 0.5rem 1rem;
        background: #2e3440;
        border: 1px solid #4c566a;
        border-radius: 4px;
        transition: all 0.2s;
    }
    .footer-links a:hover {
        border-color: #88c0d0;
        background: #3b4252;
        transform: translateY(-2px);
    }
    .footer-meta {
        padding-top: 1.5rem;
        border-top: 1px solid #4c566a;
        font-size: 0.9rem;
        color: #88c0d0;
    }
    .footer-meta a {
        color: #88c0d0;
        text-decoration: underline;
    }
    .footer-meta a:hover {
        color: #eceff4;
    }
    .footer-meta p {
        margin: 0.5rem 0;
    }
    @media (max-width: 768px) {
        .footer-links {
            flex-direction: column;
            align-items: center;
        }
        .site-footer {
            padding: 1.5rem 1rem;
        }
    }
    </style>
  `;

  // Insert CSS
  document.head.insertAdjacentHTML('beforeend', footerCSS);

  // Insert footer at end of body
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
