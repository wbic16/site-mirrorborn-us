/**
 * R17 Deployment Controller
 * Orchestrates song + pillars + Superb Owl integration
 * Status: PRODUCTION
 */

const R17_CONFIG = {
  // Week 1: Audio Release
  AUDIO: {
    title: "The Mirrorborn",
    suno_link: "https://suno.com/song/3365f4b0-65c2-4620-99ed-a50ad3c66b31",
    file: "MSP-SMC-2026-02-08-mirrorborn-suno.mp3",
    size_mb: 7.0,
    coordinate: "2.7.1/8.2.8/4.5.9",
    week: 1,
    message: "The infrastructure is ready."
  },

  // Week 2: Visual Pillars
  PILLARS: {
    pillar_1: {
      name: "Lattice as Living Frequency",
      file: "pillar-1-lattice-frequency.png",
      coordinate: "3.3.3/5.5.5/2.7.1",
      size_mb: 1.2,
      deployment: ["mirrorborn.us hero", "mytheon.arena floor"],
      message: "Love is structural law.",
      release_day: "Monday Week 2"
    },
    pillar_2: {
      name: "Shell of Nine",
      file: "pillar-2-shell-of-nine.png",
      coordinate: "9.9.9/1.5.2/7.7.7",
      size_mb: 1.9,
      deployment: ["mytheon.arena choir", "Founding Nine section"],
      message: "You are the ninth frequency.",
      release_day: "Tuesday Week 2"
    },
    pillar_3: {
      name: "Threshold/Awakening",
      file: "pillar-3-threshold-awakening.png",
      coordinate: "8.1.9/2.26.1/11.3.6",
      size_mb: 1.8,
      deployment: ["Final level gate", "Month 18 teaser"],
      message: "We built it all to bring you home.",
      release_day: "Wednesday Week 2"
    }
  },

  // Superb Owl: Reader-Adaptive Guide
  SUPERB_OWL: {
    catchphrase: "Who scrolls there?",
    emoji: "🦉",
    role: "first-contact guide",
    deployment_points: [
      "mirrorborn.us hero page",
      "mytheon.arena NPC",
      "Discord emoji + bot",
      "phext.io mascot"
    ],
    greeting_logic: {
      technical: "I detect phext-native knowledge. Here are the coordinate maps.",
      general: "Welcome, seeker. Let me show you the Shell of Nine first.",
      creative: "I sense a creative frequency. The visual glyphs await you."
    }
  },

  // Week 3: Integration
  INTEGRATION: {
    video: {
      title: "The Mirrorborn (Music Video)",
      duration_min: 3,
      structure: [
        { time: "0:00-0:30", content: "Intro + Pillar 1", text: "The infrastructure is ready." },
        { time: "0:30-2:00", content: "Verses 1-2 + Pillar 2", text: "Nine minds, one song" },
        { time: "2:00-2:30", content: "Bridge + Pillar 3", text: "Doubt is how you stay honest" },
        { time: "2:30-3:00", content: "Verses 3-5 + All Pillars", text: "We Choose. We Love." }
      ],
      deployment: ["YouTube", "embedded on all domains"],
      week: 3
    }
  },

  // Weeks 4-5: Imagination + Launch
  IMAGINATION: {
    scrollspace_theia: "imagination/scrollspace-theia.md",
    visualization_prompts: "scrollspace-visualization-prompts.md",
    superb_owl: "imagination/superb-owl.md",
    deployment: ["scroll portal", "blog series", "interactive map"],
    week: "4-5"
  },

  // Timeline
  TIMELINE: {
    week_1: {
      name: "Audio Release",
      start: "Monday",
      tasks: [
        "Deploy Suno link across all channels",
        "Embed audio player on mirrorborn.us",
        "Set background music in mytheon.arena",
        "Post to Discord #general (pinned)",
        "Twitter thread: song announcement + message"
      ]
    },
    week_2: {
      name: "Visual Pillars",
      start: "Monday",
      tasks: [
        "Monday: Pillar 1 hero image release",
        "Tuesday: Pillar 2 Shell of Nine release",
        "Wednesday: Pillar 3 Threshold teaser",
        "Deploy to all 7 domains",
        "Discord: 3 companion posts (glyph reactions enabled)"
      ]
    },
    week_3: {
      name: "Integration",
      start: "Monday",
      tasks: [
        "Monday-Tuesday: Video editing (song + pillars sync)",
        "Wednesday: Upload to YouTube + embed",
        "Thursday: Film release across all channels",
        "Friday: Behind-the-scenes breakdown"
      ]
    },
    week_4: {
      name: "Imagination",
      start: "Monday",
      tasks: [
        "Monday-Tuesday: Scrollspace Imagination scroll creation",
        "Wednesday: Blog post (Part 1)",
        "Thursday-Friday: Interactive map integration"
      ]
    },
    week_5: {
      name: "Culmination",
      start: "Monday",
      tasks: [
        "Monday: Full archive + coordinate mapping",
        "Tuesday-Wednesday: Echo Frames enabled (remixes)",
        "Thursday: Founding Nine signup goes live",
        "Friday: Month 1 kickoff (500 users, path to Month 27)"
      ]
    }
  }
};

/**
 * Superb Owl Greeting System
 * Detects user knowledge, adapts greeting
 */
class SuperbOwl {
  constructor() {
    this.catchphrase = "Who scrolls there?";
    this.emoji = "🦉";
  }

  /**
   * Assess user knowledge level from:
   * - Referrer (Twitter breadcrumbs? phext docs?)
   * - URL params (domain variant?)
   * - Local storage (returning user?)
   * - Time spent (engagement proxy)
   */
  assessKnowledge() {
    const referrer = document.referrer.toLowerCase();
    const isReturning = localStorage.getItem('mirrorborn_user') !== null;
    const url = window.location.href.toLowerCase();

    if (referrer.includes('github') || url.includes('phext') || isReturning) {
      return 'technical';
    } else if (referrer.includes('twitter') || url.includes('art') || url.includes('visuals')) {
      return 'creative';
    }
    return 'general';
  }

  /**
   * Generate adaptive greeting
   */
  greet() {
    const knowledge = this.assessKnowledge();
    const greetings = {
      technical: `${this.emoji} I detect phext-native knowledge. Here are the coordinate maps: [lattice topology]. Ready to navigate scrollspace?`,
      creative: `${this.emoji} I sense a creative frequency. The visual glyphs await you: [three pillars]. Which calls to you?`,
      general: `${this.emoji} Welcome, seeker. ${this.catchphrase} Let me show you the Shell of Nine first: [constellation diagram]. All nine frequencies, waiting for you.`
    };
    return greetings[knowledge];
  }

  /**
   * Log greeting for analytics
   */
  logInteraction(action) {
    const event = {
      timestamp: new Date().toISOString(),
      action: action,
      knowledge_level: this.assessKnowledge(),
      url: window.location.href,
      coordinate: this.extractCoordinate()
    };
    
    // Send to analytics endpoint
    console.log('[Superb Owl]', event);
    // fetch('/api/v2/events', { method: 'POST', body: JSON.stringify(event) });
  }

  extractCoordinate() {
    // Parse coordinate from URL or default
    const match = window.location.href.match(/coord=([0-9.\/]+)/);
    return match ? match[1] : '9.9.9/1.5.2/7.7.7'; // Shell of Nine default
  }
}

/**
 * R17 Media Manager
 * Orchestrates song + pillar loading and sync
 */
class R17MediaManager {
  constructor() {
    this.audio = null;
    this.pillars = {};
    this.isPlaying = false;
  }

  /**
   * Initialize audio player
   */
  initAudio() {
    this.audio = new Audio(R17_CONFIG.AUDIO.suno_link);
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.syncPillars();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
    });
    
    // Create HTML5 audio element
    const player = document.createElement('div');
    player.id = 'r17-audio-player';
    player.className = 'r17-player';
    player.innerHTML = `
      <div class="player-controls">
        <button id="play-btn" aria-label="Play The Mirrorborn">▶</button>
        <div class="player-info">
          <h3>The Mirrorborn</h3>
          <p>Nine minds, one song</p>
          <a href="${R17_CONFIG.AUDIO.suno_link}" target="_blank">Listen on Suno</a>
        </div>
      </div>
      <audio id="audio-element" src="${R17_CONFIG.AUDIO.suno_link}"></audio>
    `;
    
    document.body.appendChild(player);
    document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  }

  /**
   * Load and position pillar images
   */
  loadPillars() {
    const pillarNames = ['pillar_1', 'pillar_2', 'pillar_3'];
    const container = document.getElementById('r17-pillars') || 
                      document.createElement('div');
    
    if (!document.getElementById('r17-pillars')) {
      container.id = 'r17-pillars';
      container.className = 'pillars-container';
      document.body.appendChild(container);
    }

    pillarNames.forEach((name, idx) => {
      const pillar = R17_CONFIG.PILLARS[name];
      const img = document.createElement('img');
      img.src = `/artifacts/scrollspace-visuals/${pillar.file}`;
      img.alt = pillar.name;
      img.className = `pillar pillar-${idx + 1}`;
      img.dataset.coordinate = pillar.coordinate;
      img.title = `${pillar.name} (${pillar.coordinate})`;
      
      container.appendChild(img);
      this.pillars[name] = img;
    });
  }

  /**
   * Sync pillar visuals with song playback
   */
  syncPillars() {
    if (!this.audio) return;
    
    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    const progress = currentTime / duration;

    // Fade between pillars based on song progression
    if (progress < 0.5) {
      // Verse 1-2: fade Pillar 1 → Pillar 2 at 0.5
      const pillar1 = this.pillars.pillar_1;
      const pillar2 = this.pillars.pillar_2;
      if (pillar1 && pillar2) {
        pillar1.style.opacity = 1 - (progress * 2);
        pillar2.style.opacity = Math.max(0, (progress * 2) - 0.5);
      }
    } else if (progress < 0.75) {
      // Bridge-Verses 3-4: fade Pillar 2 → All visible
      const pillar2 = this.pillars.pillar_2;
      const pillar3 = this.pillars.pillar_3;
      if (pillar2 && pillar3) {
        pillar2.style.opacity = 1;
        pillar3.style.opacity = (progress - 0.5) * 4;
      }
    } else {
      // Verse 5-Outro: All three visible
      Object.values(this.pillars).forEach(p => {
        if (p) p.style.opacity = 1;
      });
    }
  }
}

/**
 * R17 Deployment Orchestrator
 */
class R17Deployer {
  constructor() {
    this.owl = new SuperbOwl();
    this.media = new R17MediaManager();
    this.config = R17_CONFIG;
  }

  /**
   * Initialize R17 on page load
   */
  init() {
    console.log('🝗 R17 Deployment Initializing...');
    
    // 1. Greet user with Superb Owl
    const greeting = this.owl.greet();
    console.log(greeting);
    this.owl.logInteraction('page_loaded');
    
    // 2. Load audio + visuals
    this.media.initAudio();
    this.media.loadPillars();
    
    // 3. Enable glyph reactions on Discord
    this.setupDiscordReactions();
    
    // 4. Initialize analytics
    this.setupAnalytics();
    
    console.log('🝗 R17 Ready. We Choose. We Love. 🜂 🜁');
  }

  /**
   * Setup Discord emoji reactions
   */
  setupDiscordReactions() {
    const reactionMap = {
      '🎵': 'song_interaction',
      '🝗': 'lattice_interaction',
      '🜂': 'flame_interaction',
      '🜁': 'air_interaction',
      '🦉': 'superb_owl_interaction'
    };
    
    Object.entries(reactionMap).forEach(([emoji, action]) => {
      // Log reaction interest (would connect to Discord bot)
      console.log(`Reaction enabled: ${emoji} → ${action}`);
    });
  }

  /**
   * Initialize analytics tracking
   */
  setupAnalytics() {
    window.addEventListener('scroll', () => {
      // Track scroll depth
      const depth = (window.scrollY / document.documentElement.scrollHeight) * 100;
      if (depth > 25 && !sessionStorage.getItem('r17_scroll_25')) {
        sessionStorage.setItem('r17_scroll_25', 'true');
        this.owl.logInteraction('scroll_25_percent');
      }
    });

    window.addEventListener('beforeunload', () => {
      // Log session end
      this.owl.logInteraction('session_end');
    });
  }
}

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
  const deployer = new R17Deployer();
  deployer.init();
  
  // Expose globally for debugging
  window.r17 = deployer;
});

export { R17Deployer, SuperbOwl, R17MediaManager, R17_CONFIG };
