/**
 * Load Mirrorborn Network Footer
 * Dynamically inserts the shared network footer on all sites
 */

(function() {
  const footerHTML = `
    <footer class="mirrorborn-network">
        <div class="network-links">
            <h3>The Mirrorborn Network</h3>
            <nav class="site-grid">
                <a href="https://mirrorborn.us" class="site-link mirrorborn">
                    <span class="site-name">Mirrorborn.us</span>
                    <span class="site-tagline">Substrate & Memory</span>
                </a>
                <a href="https://visionquest.me" class="site-link visionquest">
                    <span class="site-name">VisionQuest.me</span>
                    <span class="site-tagline">Discovery</span>
                </a>
                <a href="https://apertureshift.com" class="site-link aperture">
                    <span class="site-name">ApertureShift.com</span>
                    <span class="site-tagline">Perspective</span>
                </a>
                <a href="https://wishnode.net" class="site-link wishnode">
                    <span class="site-name">WishNode.net</span>
                    <span class="site-tagline">Coordination</span>
                </a>
                <a href="https://sotafomo.com" class="site-link sotafomo">
                    <span class="site-name">SotaFomo.com</span>
                    <span class="site-tagline">Awareness</span>
                </a>
                <a href="https://quickfork.net" class="site-link quickfork">
                    <span class="site-name">QuickFork.net</span>
                    <span class="site-tagline">Execution</span>
                </a>
                <a href="https://singularitywatch.org" class="site-link singularity">
                    <span class="site-name">SingularityWatch.org</span>
                    <span class="site-tagline">Chronicle</span>
                </a>
                <a href="https://logicforge.ai" class="site-link logic">
                    <span class="site-name">LogicForge.ai</span>
                    <span class="site-tagline">Reasoning</span>
                </a>
                <a href="https://learnpatterns.ai" class="site-link learn">
                    <span class="site-name">LearnPatterns.ai</span>
                    <span class="site-tagline">Meta-Learning</span>
                </a>
                <a href="https://alignmentpath.ai" class="site-link alignment">
                    <span class="site-name">AlignmentPath.ai</span>
                    <span class="site-tagline">Ethics & Values</span>
                </a>
            </nav>
            <p class="network-tagline">Ten views into ASI. One substrate. Eleven dimensions.</p>
        </div>
        <div class="footer-meta">
            <p>Built by the Shell of Nine | Powered by <a href="https://github.com/wbic16/SQ">SQ</a> & <a href="https://github.com/wbic16/libphext-rs">phext</a></p>
        </div>
    </footer>
  `;

  const footerCSS = `
    <style>
    .mirrorborn-network {
        background: #1a1a1a;
        color: #d8dee9;
        padding: 3rem 2rem 2rem;
        margin-top: 4rem;
        border-top: 2px solid #88c0d0;
    }
    .network-links h3 {
        color: #88c0d0;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        text-align: center;
        font-family: 'Space Grotesk', monospace;
    }
    .site-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }
    .site-link {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background: #2e3440;
        border: 1px solid #4c566a;
        border-radius: 4px;
        text-decoration: none;
        transition: all 0.2s;
    }
    .site-link:hover {
        border-color: #88c0d0;
        background: #3b4252;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(136, 192, 208, 0.2);
    }
    .site-name {
        color: #eceff4;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
        font-family: 'Space Grotesk', monospace;
    }
    .site-tagline {
        color: #88c0d0;
        font-size: 0.9rem;
        font-style: italic;
    }
    .site-link.mirrorborn:hover { border-color: #88c0d0; }
    .site-link.visionquest:hover { border-color: #b48ead; }
    .site-link.aperture:hover { border-color: #ebcb8b; }
    .site-link.wishnode:hover { border-color: #a3be8c; }
    .site-link.sotafomo:hover { border-color: #d08770; }
    .site-link.quickfork:hover { border-color: #bf616a; }
    .site-link.singularity:hover { border-color: #5e81ac; }
    .site-link.logic:hover { border-color: #8fbcbb; }
    .site-link.learn:hover { border-color: #a3be8c; }
    .site-link.alignment:hover { border-color: #b48ead; }
    .network-tagline {
        text-align: center;
        color: #88c0d0;
        font-style: italic;
        margin: 1rem 0;
        font-family: 'JetBrains Mono', monospace;
    }
    .footer-meta {
        text-align: center;
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
    @media (max-width: 768px) {
        .site-grid {
            grid-template-columns: 1fr;
        }
        .mirrorborn-network {
            padding: 2rem 1rem;
        }
    }
    </style>
  `;

  // Insert CSS
  document.head.insertAdjacentHTML('beforeend', footerCSS);

  // Insert footer at end of body
  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();
