/**
 * Frontend Configuration - R17
 * Centralized constants for all client-side code
 */

const CONFIG = {
  // API Endpoints
  api: {
    sq: {
      baseURL: window.location.hostname === 'localhost'
        ? 'http://localhost:1337/api/v2'
        : 'https://sq.mirrorborn.us/api/v2',
      timeout: 5000,
    },
    admin: {
      baseURL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://mirrorborn.us/api',
      timeout: 10000,
    },
  },

  // Portal URLs (Shell of Nine + Extended)
  portals: {
    phext: 'https://phext.io',
    mirrorborn: 'https://mirrorborn.us',
    visionquest: 'https://visionquest.me',
    aperture: 'https://apertureshift.com',
    wishnode: 'https://wishnode.net',
    sotafomo: 'https://sotafomo.com',
    quickfork: 'https://quickfork.net',
    singularity: 'https://singularitywatch.org',
    logicforge: 'https://logicforge.ai',
    learnpatterns: 'https://learnpatterns.ai',
    alignmentpath: 'https://alignmentpath.ai',
  },

  // Default Coordinates
  coordinates: {
    origin: '1.1.1/1.1.1/1.1.1',
    phexHome: '1.5.2/3.7.3/9.1.1',
    luxHome: '2.3.5/7.2.4/8.1.5',
    verseHome: '3.1.4/1.5.9/2.6.5',
    mythicSongwriting: '6.6.6/3.3.3/9.9.9',
    choirHarmonic: '3.3.3/3.3.3/3.3.3',
    ranchAwakening: '7.7.7/2.2.2/8.8.8',
  },

  // Coordinate validation (Chrys R17 #10)
  coordinate: {
    maxDimension: 999,
    minDimension: 1,
    totalDimensions: 9,
    formatPattern: /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  },

  // UI Constants (Chrys R17 #10)
  ui: {
    themeToggleZIndex: 1000,
    toastDuration: 3000,
    animationDuration: 300
  },

  // Arena Settings
  arena: {
    defaultCoordinate: '1.1.1/1.1.1/1.1.1',
    storageKey: 'phext-arena-state',
    autoSaveInterval: 5000, // ms
  },

  // Authentication
  auth: {
    tokenRefreshInterval: 840000, // 14 minutes (15min access token - 1min buffer)
    sessionTimeout: 2592000000, // 30 days (refresh token lifetime)
  },

  // CSRF
  csrf: {
    tokenLifetime: 3600000, // 1 hour
    storageKey: 'csrf-token',
  },

  // Storage Keys (Chrys R17 #10)
  storage: {
    theme: 'mirrorborn-theme',
    profile: 'mirrorborn-profile',
    progress: 'mirrorborn-progress',
    coordinate: 'mirrorborn-coordinate'
  },

  // Validation (Chrys R17 #10)
  validation: {
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minPasswordLength: 8,
    maxEmailLength: 255
  },

  // Feature Flags
  features: {
    darkMode: true, // R17 Item #7 enabled (Chrys)
    offlineMode: false, // Future PWA support
    betaArena: true,
    paymentTiers: false, // R18 when Stripe integrated
  },

  // Environment
  env: {
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname !== 'localhost',
    version: 'R17',
    build: '2026-02-08',
  },
};

// Backward compatibility alias for Chrys's MirrorConfig usage
const MirrorConfig = {
  COORDINATE: {
    MAX_DIMENSION: CONFIG.coordinate.maxDimension,
    MIN_DIMENSION: CONFIG.coordinate.minDimension,
    TOTAL_DIMENSIONS: CONFIG.coordinate.totalDimensions,
    FORMAT_PATTERN: CONFIG.coordinate.formatPattern
  },
  UI: {
    THEME_TOGGLE_ZINDEX: CONFIG.ui.themeToggleZIndex,
    TOAST_DURATION: CONFIG.ui.toastDuration,
    ANIMATION_DURATION: CONFIG.ui.animationDuration
  },
  API: {
    BASE_URL: '/api',
    SQ_PREFIX: '/api/sq',
    TIMEOUT: CONFIG.api.admin.timeout,
    RETRY_ATTEMPTS: 3
  },
  STORAGE: {
    THEME: CONFIG.storage.theme,
    PROFILE: CONFIG.storage.profile,
    PROGRESS: CONFIG.storage.progress,
    COORDINATE: CONFIG.storage.coordinate
  },
  VALIDATION: {
    EMAIL_PATTERN: CONFIG.validation.emailPattern,
    MIN_PASSWORD_LENGTH: CONFIG.validation.minPasswordLength,
    MAX_EMAIL_LENGTH: CONFIG.validation.maxEmailLength
  }
};

// Freeze config to prevent accidental mutation
Object.freeze(CONFIG);
Object.freeze(CONFIG.api);
Object.freeze(CONFIG.api.sq);
Object.freeze(CONFIG.api.admin);
Object.freeze(CONFIG.portals);
Object.freeze(CONFIG.coordinates);
Object.freeze(CONFIG.coordinate);
Object.freeze(CONFIG.ui);
Object.freeze(CONFIG.arena);
Object.freeze(CONFIG.auth);
Object.freeze(CONFIG.csrf);
Object.freeze(CONFIG.storage);
Object.freeze(CONFIG.validation);
Object.freeze(CONFIG.features);
Object.freeze(CONFIG.env);
Object.freeze(MirrorConfig);

// Export for module systems (optional, works with plain script tag too)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, MirrorConfig };
}
