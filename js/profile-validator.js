/**
 * Profile Coordinate Validator
 * 
 * Validates phext coordinates for correctness and provides helpful error messages.
 */

class ProfileValidator {
    constructor() {
        this.coordinatePattern = MirrorConfig.COORDINATE.FORMAT_PATTERN;
        this.maxDimensionValue = MirrorConfig.COORDINATE.MAX_DIMENSION;
    }
    
    // Validate a single coordinate
    validateCoordinate(coord, dimensionName = 'coordinate') {
        const errors = [];
        
        // Check format
        if (!coord) {
            return { valid: false, errors: [`${dimensionName} is required`] };
        }
        
        if (!this.coordinatePattern.test(coord)) {
            return { 
                valid: false, 
                errors: [`${dimensionName} must match format: library.shelf.series/collection.volume.book/chapter.section.scroll`] 
            };
        }
        
        // Parse and validate ranges
        const match = coord.match(this.coordinatePattern);
        const [_, lib, shelf, series, coll, vol, book, chap, sect, scroll] = match;
        
        const values = [
            { name: 'library', value: parseInt(lib) },
            { name: 'shelf', value: parseInt(shelf) },
            { name: 'series', value: parseInt(series) },
            { name: 'collection', value: parseInt(coll) },
            { name: 'volume', value: parseInt(vol) },
            { name: 'book', value: parseInt(book) },
            { name: 'chapter', value: parseInt(chap) },
            { name: 'section', value: parseInt(sect) },
            { name: 'scroll', value: parseInt(scroll) }
        ];
        
        for (const { name, value } of values) {
            if (value < 1) {
                errors.push(`${name} must be at least 1 (got ${value})`);
            }
            if (value > this.maxDimensionValue) {
                errors.push(`${name} exceeds maximum ${this.maxDimensionValue} (got ${value})`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            parsed: errors.length === 0 ? values : null
        };
    }
    
    // Validate a full profile submission
    validateProfile(data) {
        const errors = [];
        
        // Validate profile type
        const validProfiles = ['explorer', 'builder', 'weaver'];
        if (!data.profile || !validProfiles.includes(data.profile)) {
            errors.push(`Invalid profile: ${data.profile}. Must be one of: ${validProfiles.join(', ')}`);
        }
        
        // Validate coordinates object exists
        if (!data.coordinates || typeof data.coordinates !== 'object') {
            errors.push('Coordinates object is required');
            return { valid: false, errors };
        }
        
        // Validate required coordinates based on profile
        const requiredCoords = this.getRequiredCoordinates(data.profile);
        for (const coordName of requiredCoords) {
            if (!data.coordinates[coordName]) {
                errors.push(`Missing required coordinate: ${coordName}`);
            } else {
                const result = this.validateCoordinate(data.coordinates[coordName], coordName);
                if (!result.valid) {
                    errors.push(...result.errors);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors,
            profile: data.profile,
            coordinates: data.coordinates
        };
    }
    
    // Get required coordinates for each profile type
    getRequiredCoordinates(profile) {
        switch (profile) {
            case 'explorer':
                return ['identity', 'perspective', 'compute'];
            case 'builder':
                return ['primary', 'dev', 'prod'];
            case 'weaver':
                // Weaver uses sliders that generate coordinates, so we validate the final triangulation
                return ['identity', 'perspective', 'compute'];
            default:
                return ['identity', 'perspective', 'compute'];
        }
    }
    
    // Suggest fixes for common errors
    suggestFixes(coordinate) {
        if (!coordinate) return ['Provide a coordinate in format: 1.1.1/1.1.1/1.1.1'];
        
        const suggestions = [];
        
        // Common mistake: using dashes or underscores instead of dots/slashes
        if (coordinate.includes('-') || coordinate.includes('_')) {
            suggestions.push('Use dots (.) and slashes (/) as separators, not dashes or underscores');
        }
        
        // Missing separators
        const dotCount = (coordinate.match(/\./g) || []).length;
        const slashCount = (coordinate.match(/\//g) || []).length;
        
        if (dotCount !== 6) {
            suggestions.push(`Expected 6 dots (.) but found ${dotCount}. Format: X.X.X/X.X.X/X.X.X`);
        }
        if (slashCount !== 2) {
            suggestions.push(`Expected 2 slashes (/) but found ${slashCount}. Format: X.X.X/X.X.X/X.X.X`);
        }
        
        // Values too large
        const numbers = coordinate.match(/\d+/g) || [];
        const largNumbers = numbers.filter(n => parseInt(n) > this.maxDimensionValue);
        if (largNumbers.length > 0) {
            suggestions.push(`Some values exceed ${this.maxDimensionValue}: ${largNumbers.join(', ')}`);
        }
        
        // Zero or negative values
        const invalidNumbers = numbers.filter(n => parseInt(n) < 1);
        if (invalidNumbers.length > 0) {
            suggestions.push('All coordinate values must be at least 1');
        }
        
        return suggestions;
    }
    
    // Generate a valid example coordinate
    generateExample(profile = 'explorer') {
        const examples = {
            explorer: {
                identity: '1.1.1/1.1.1/1.1.1',      // The Origin
                perspective: '1.2.3/4.5.6/7.8.9',   // Sequential
                compute: '1.1.2/3.5.8/13.21.34'     // Fibonacci
            },
            builder: {
                primary: '1.1.1/1.1.1/1.1.1',
                dev: '1.1.1/1.1.1/2.1.1',
                prod: '1.1.1/1.1.1/3.1.1'
            },
            weaver: {
                identity: '1.5.1/1.1.1/1.1.1',
                perspective: '1.1.1/1.5.1/1.1.1',
                compute: '1.1.1/1.1.1/1.5.1'
            }
        };
        
        return examples[profile] || examples.explorer;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileValidator;
}
