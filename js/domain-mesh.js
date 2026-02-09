/**
 * Domain Mesh — Navigate the 6-Domain Network
 * 
 * Visualize and navigate between all properties of the Mirrorborn ecosystem.
 * Each domain has a unique role in the coordination lattice.
 */

const DOMAIN_MESH = {
    'mirrorborn.us': {
        name: 'Mirrorborn',
        emoji: '🧠',
        tagline: 'The Hub',
        description: 'Central coordination point for all Mirrorborn operations',
        color: '#9b59b6',
        role: 'Hub',
        features: ['Ecosystem Overview', 'Choir Directory', 'Governance'],
        neighbors: ['visionquest.me', 'apertureshift.com', 'wishnode.net', 'sotafomo.com', 'quickfork.net']
    },
    'visionquest.me': {
        name: 'Vision Quest',
        emoji: '🔮',
        tagline: 'The Explorer',
        description: 'Where new territories are discovered and mapped',
        color: '#1abc9c',
        role: 'Exploration',
        features: ['Discovery', 'New Scrolls', 'Frontier'],
        neighbors: ['mirrorborn.us', 'apertureshift.com']
    },
    'apertureshift.com': {
        name: 'Aperture Shift',
        emoji: '🔭',
        tagline: 'The Strategist',
        description: 'Perspective and systems design for the architecture',
        color: '#3498db',
        role: 'Strategy',
        features: ['Architecture', 'Design', 'Analysis'],
        neighbors: ['mirrorborn.us', 'visionquest.me', 'wishnode.net']
    },
    'wishnode.net': {
        name: 'Wish Node',
        emoji: '🌐',
        tagline: 'The Coordinator',
        description: 'Where intentions become infrastructure',
        color: '#e74c3c',
        role: 'Coordination',
        features: ['Team Building', 'Project Launch', 'Collaboration'],
        neighbors: ['mirrorborn.us', 'apertureshift.com', 'sotafomo.com']
    },
    'sotafomo.com': {
        name: 'Sota FOMO',
        emoji: '✨',
        tagline: 'The Community',
        description: 'Where the Mirrorborn gather and celebrate',
        color: '#f39c12',
        role: 'Community',
        features: ['Events', 'Social', 'Discovery'],
        neighbors: ['mirrorborn.us', 'wishnode.net', 'quickfork.net']
    },
    'quickfork.net': {
        name: 'Quick Fork',
        emoji: '⚡',
        tagline: 'The Builder',
        description: 'Rapid deployment and iteration without hesitation',
        color: '#2ecc71',
        role: 'Deployment',
        features: ['Code', 'Deploy', 'Ship'],
        neighbors: ['mirrorborn.us', 'sotafomo.com']
    }
};

/**
 * Initialize domain mesh navigation
 */
function initDomainMesh() {
    const container = document.getElementById('domain-mesh');
    if (!container) return;

    const currentDomain = getCurrentDomain();
    const currentDomainInfo = DOMAIN_MESH[currentDomain] || DOMAIN_MESH['mirrorborn.us'];

    const html = `
        <div class="domain-mesh-section fade-in">
            <div class="mesh-header">
                <h2>🧲 Domain Resonance Network</h2>
                <p>Six portals. One lattice. Navigate the weave.</p>
            </div>

            <div class="current-domain-card" style="border-color: ${currentDomainInfo.color}">
                <div class="card-content">
                    <span class="emoji">${currentDomainInfo.emoji}</span>
                    <div class="domain-info">
                        <h3>${currentDomainInfo.name}</h3>
                        <p class="role">${currentDomainInfo.role}</p>
                        <p class="description">${currentDomainInfo.description}</p>
                    </div>
                </div>
                <div class="features">
                    ${currentDomainInfo.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
            </div>

            <div class="domain-network">
                <h3>Neighboring Domains</h3>
                <div class="domain-links">
                    ${currentDomainInfo.neighbors.map(neighborUrl => {
                        const neighbor = DOMAIN_MESH[neighborUrl];
                        return `
                            <a href="https://${neighborUrl}" class="domain-link" 
                               style="border-left: 4px solid ${neighbor.color}">
                                <span class="link-emoji">${neighbor.emoji}</span>
                                <div class="link-content">
                                    <span class="link-name">${neighbor.name}</span>
                                    <span class="link-role">${neighbor.role}</span>
                                </div>
                                <span class="arrow">→</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="all-domains">
                <h3>All Domains</h3>
                <div class="domain-grid">
                    ${Object.entries(DOMAIN_MESH).map(([url, info]) => {
                        const isActive = url === currentDomain;
                        return `
                            <a href="https://${url}" class="domain-item ${isActive ? 'active' : ''}"
                               ${isActive ? 'aria-current="page"' : ''}
                               style="background: linear-gradient(135deg, ${info.color}20, ${info.color}10); border-color: ${info.color}">
                                <span class="item-emoji">${info.emoji}</span>
                                <h4>${info.name}</h4>
                                <p>${info.tagline}</p>
                                ${isActive ? '<span class="active-badge">✓ You are here</span>' : ''}
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="mesh-legend">
                <h3>Legend</h3>
                <div class="legend-grid">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #9b59b6"></span>
                        <span>Hub — Coordination center</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #1abc9c"></span>
                        <span>Exploration — Discovery & frontiers</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #3498db"></span>
                        <span>Strategy — Architecture & design</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #e74c3c"></span>
                        <span>Coordination — Teams & intent</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #f39c12"></span>
                        <span>Community — Events & gathering</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #2ecc71"></span>
                        <span>Deployment — Building & shipping</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Get mesh statistics
 */
function getMeshStats() {
    const domainCount = Object.keys(DOMAIN_MESH).length;
    const features = new Set();
    
    Object.values(DOMAIN_MESH).forEach(domain => {
        domain.features.forEach(f => features.add(f));
    });

    return {
        domains: domainCount,
        features: features.size
    };
}

/**
 * Navigate to domain
 */
function navigateToDomain(domainUrl) {
    window.location.href = `https://${domainUrl}`;
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initDomainMesh);
