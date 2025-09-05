/**
 * Configuration Manager for OpenAI API Proxy
 * Supports both single key (v1.0) and multiple keys (v2.0) modes
 */

class ConfigManager {
  constructor() {
    this.config = this.loadConfig();
    this.watchers = [];
  }

  /**
   * Load configuration from environment variables
   * Priority: OPENAI_API_KEYS_JSON > OPENAI_API_KEYS > OPENAI_API_KEY
   */
  loadConfig() {
    // Check for JSON format multiple keys
    if (process.env.OPENAI_API_KEYS_JSON) {
      try {
        const keys = JSON.parse(process.env.OPENAI_API_KEYS_JSON);
        return {
          mode: 'multi',
          keys: this.normalizeKeys(keys),
          strategy: process.env.LOAD_BALANCER_STRATEGY || 'roundrobin'
        };
      } catch (error) {
        console.error('Error parsing OPENAI_API_KEYS_JSON:', error.message);
        throw new Error('Invalid OPENAI_API_KEYS_JSON format');
      }
    }

    // Check for simple comma-separated multiple keys
    if (process.env.OPENAI_API_KEYS) {
      const keys = process.env.OPENAI_API_KEYS.split(',').map(key => key.trim()).filter(key => key);
      if (keys.length > 0) {
        return {
          mode: 'multi',
          keys: this.normalizeKeys(keys),
          strategy: process.env.LOAD_BALANCER_STRATEGY || 'roundrobin'
        };
      }
    }

    // Fallback to single key mode
    if (process.env.OPENAI_API_KEY) {
      return {
        mode: 'single',
        key: process.env.OPENAI_API_KEY
      };
    }

    throw new Error('No API keys configured. Please set OPENAI_API_KEY or OPENAI_API_KEYS');
  }

  /**
   * Normalize keys to consistent format
   * @param {string|string[]|Object[]} keys - Raw keys
   * @returns {Object[]} Normalized keys array
   */
  normalizeKeys(keys) {
    if (typeof keys === 'string') {
      return [{ id: this.generateKeyId(keys), key: keys, weight: 1, enabled: true }];
    }

    if (Array.isArray(keys)) {
      return keys.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: this.generateKeyId(item),
            key: item,
            weight: 1,
            enabled: true
          };
        } else if (typeof item === 'object' && item.key) {
          return {
            id: item.id || this.generateKeyId(item.key),
            key: item.key,
            weight: item.weight || 1,
            enabled: item.enabled !== false
          };
        } else {
          throw new Error(`Invalid key format at index ${index}`);
        }
      });
    }

    throw new Error('Keys must be string, array of strings, or array of objects');
  }

  /**
   * Generate a unique ID for a key
   * @param {string} key - API key
   * @returns {string} Generated ID
   */
  generateKeyId(key) {
    // Use last 8 characters of key as ID (for demo purposes)
    // In production, you might want to use hashing
    return `key_${key.slice(-8)}`;
  }

  /**
   * Check if configuration uses multiple keys
   * @returns {boolean}
   */
  hasMultipleKeys() {
    return this.config.mode === 'multi' && this.config.keys.length > 0;
  }

  /**
   * Get configuration
   * @returns {Object}
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get all API keys
   * @returns {Array}
   */
  getKeys() {
    return this.config.mode === 'multi' ? this.config.keys : [];
  }

  /**
   * Get single API key
   * @returns {string|null}
   */
  getSingleKey() {
    return this.config.mode === 'single' ? this.config.key : null;
  }

  /**
   * Get load balancing strategy
   * @returns {string}
   */
  getStrategy() {
    return this.config.strategy || 'roundrobin';
  }

  /**
   * Validate configuration
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (this.config.mode === 'single') {
      if (!this.config.key) {
        errors.push('Single API key is missing');
      } else if (!this.config.key.startsWith('sk-')) {
        errors.push('Invalid API key format (should start with sk-)');
      }
    } else if (this.config.mode === 'multi') {
      if (!this.config.keys || this.config.keys.length === 0) {
        errors.push('No API keys configured');
      } else {
        this.config.keys.forEach((keyObj, index) => {
          if (!keyObj.key) {
            errors.push(`Key at index ${index} is missing key value`);
          } else if (!keyObj.key.startsWith('sk-')) {
            errors.push(`Key at index ${index} has invalid format`);
          }
          if (typeof keyObj.weight !== 'number' || keyObj.weight < 0) {
            errors.push(`Key at index ${index} has invalid weight`);
          }
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Add configuration change watcher
   * @param {Function} callback - Callback function
   */
  addWatcher(callback) {
    this.watchers.push(callback);
  }

  /**
   * Reload configuration
   */
  reload() {
    const oldConfig = this.config;
    this.config = this.loadConfig();
    
    // Notify watchers of configuration change
    this.watchers.forEach(callback => {
      try {
        callback(this.config, oldConfig);
      } catch (error) {
        console.error('Error in config watcher:', error);
      }
    });
  }
}

module.exports = ConfigManager;