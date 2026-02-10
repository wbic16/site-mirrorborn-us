/**
 * Mirrorborn API Client Library
 * 
 * Provides a unified interface for interacting with:
 * - SQ Cloud API
 * - User Provisioning API
 * - Profile Management API
 * 
 * Usage:
 *   const api = new MirrorbornAPI();
 *   await api.profiles.save({ profile: 'explorer', coordinates: {...} });
 */

class MirrorbornAPI {
    constructor(options = {}) {
        this.baseURL = options.baseURL || '';
        this.apiKey = options.apiKey || null;
        this.debug = options.debug || false;
    }
    
    // Logging helper
    log(...args) {
        if (this.debug) {
            console.log('[MirrorbornAPI]', ...args);
        }
    }
    
    // HTTP helper with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        
        try {
            this.log(`${options.method || 'GET'} ${url}`, options.body);
            
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.log('Response:', data);
            return data;
            
        } catch (error) {
            this.log('Error:', error);
            
            // Store offline for retry
            if (options.offlineCache) {
                const offlineQueue = JSON.parse(localStorage.getItem('apiOfflineQueue') || '[]');
                offlineQueue.push({
                    endpoint,
                    options,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('apiOfflineQueue', JSON.stringify(offlineQueue));
            }
            
            throw error;
        }
    }
    
    // Profile Management
    profiles = {
        save: async (data) => {
            // Validate profile data
            const validProfiles = ['explorer', 'builder', 'weaver'];
            if (!validProfiles.includes(data.profile)) {
                throw new Error(`Invalid profile: ${data.profile}`);
            }
            
            // Validate coordinates structure
            if (!data.coordinates || !data.coordinates.identity) {
                throw new Error('Missing required coordinate: identity');
            }
            
            // For now, store locally (will POST to API when ready)
            localStorage.setItem('userProfile', JSON.stringify(data));
            localStorage.setItem('userProfileSavedAt', new Date().toISOString());
            
            this.log('Profile saved locally:', data);
            
            // TODO: Uncomment when Theia's API is ready
            // return await this.request('/api/user/profile', {
            //     method: 'POST',
            //     body: JSON.stringify(data),
            //     offlineCache: true
            // });
            
            return { success: true, data, local: true };
        },
        
        load: async () => {
            const stored = localStorage.getItem('userProfile');
            if (stored) {
                return JSON.parse(stored);
            }
            
            // TODO: Fetch from API when ready
            // return await this.request('/api/user/profile');
            
            return null;
        }
    };
    
    // Provisioning API
    provisioning = {
        request: async (data) => {
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                throw new Error('Invalid email address');
            }
            
            // Validate username
            if (!data.username || data.username.length < 3) {
                throw new Error('Username must be at least 3 characters');
            }
            
            // Store locally for now
            localStorage.setItem('provisioningRequest', JSON.stringify(data));
            this.log('Provisioning request stored:', data);
            
            // TODO: Uncomment when Theia's API is ready
            // return await this.request('/api/provision-request', {
            //     method: 'POST',
            //     body: JSON.stringify(data),
            //     offlineCache: true
            // });
            
            return { 
                success: true, 
                message: 'Request stored. Will submit when API is available.',
                data,
                local: true
            };
        }
    };
    
    // SQ Cloud API
    sq = {
        read: async (coordinate) => {
            if (!this.apiKey) {
                throw new Error('API key required for SQ Cloud access');
            }
            
            return await this.request(`/api/v2/read?c=${encodeURIComponent(coordinate)}`);
        },
        
        write: async (coordinate, content) => {
            if (!this.apiKey) {
                throw new Error('API key required for SQ Cloud access');
            }
            
            return await this.request(`/api/v2/write`, {
                method: 'POST',
                body: JSON.stringify({ coordinate, content })
            });
        },
        
        list: async (coordinate) => {
            return await this.request(`/api/v2/toc?c=${encodeURIComponent(coordinate)}`);
        }
    };
    
    // Analytics
    analytics = {
        track: (event, properties = {}) => {
            const data = {
                event,
                properties: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    profile: localStorage.getItem('selectedProfile')
                }
            };
            
            // Store locally with size limits
            const events = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
            events.push(data);
            
            // Enforce size limits: max 100 events OR 50KB
            const MAX_EVENTS = 100;
            const MAX_SIZE_BYTES = 50000; // 50 KB
            
            let trimmedEvents = events.slice(-MAX_EVENTS);
            let eventsJson = JSON.stringify(trimmedEvents);
            
            // If still too large, trim more aggressively
            while (eventsJson.length > MAX_SIZE_BYTES && trimmedEvents.length > 10) {
                trimmedEvents = trimmedEvents.slice(-Math.floor(trimmedEvents.length / 2));
                eventsJson = JSON.stringify(trimmedEvents);
            }
            
            localStorage.setItem('analyticsEvents', eventsJson);
            this.log('Analytics event:', data, `(${trimmedEvents.length} events, ${eventsJson.length} bytes)`);
            
            // TODO: Send to analytics backend when ready
            return data;
        }
    };
    
    // Retry offline queue
    async retryOfflineQueue() {
        const queue = JSON.parse(localStorage.getItem('apiOfflineQueue') || '[]');
        const results = [];
        
        for (const item of queue) {
            try {
                const result = await this.request(item.endpoint, item.options);
                results.push({ success: true, item, result });
            } catch (error) {
                results.push({ success: false, item, error: error.message });
            }
        }
        
        // Clear successfully sent items
        const remaining = queue.filter((item, i) => !results[i].success);
        localStorage.setItem('apiOfflineQueue', JSON.stringify(remaining));
        
        return results;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MirrorbornAPI;
}
