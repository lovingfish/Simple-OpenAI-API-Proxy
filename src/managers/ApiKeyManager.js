const { logger } = require('../utils/helpers');

/**
 * API Key Manager for handling multiple OpenAI API keys
 */
class ApiKeyManager {
  constructor(config, strategy) {
    this.keys = new Map(); // keyId -> keyInfo
    this.activeKeys = []; // Array of active key IDs
    this.failedKeys = new Map(); // keyId -> failure info
    this.stats = new Map(); // keyId -> usage statistics
    this.strategy = strategy;
    
    // Initialize keys
    this.initializeKeys(config.keys);
    
    // Start failure recovery timer
    this.startRecoveryTimer();
  }

  /**
   * Initialize API keys from configuration
   * @param {Array} keys - Array of key objects
   */
  initializeKeys(keys) {
    keys.forEach(keyObj => {
      const { id, key, weight = 1, enabled = true } = keyObj;
      
      if (!enabled) return;
      
      this.keys.set(id, {
        id,
        key,
        weight,
        enabled: true,
        failures: 0,
        lastUsed: null,
        lastFailure: null
      });
      
      this.activeKeys.push(id);
      
      // Initialize stats
      this.stats.set(id, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        lastUsed: null,
        responseTime: []
      });
    });
    
    logger.info(`Initialized ${this.activeKeys.length} API keys`);
  }

  /**
   * Get next API key using configured strategy
   * @returns {string} API key
   */
  getNextKey() {
    if (this.activeKeys.length === 0) {
      throw new Error('No available API keys');
    }
    
    const keyId = this.strategy.select(this.getActiveKeyInfos());
    const keyInfo = this.keys.get(keyId);
    
    if (!keyInfo) {
      logger.error(`Selected key ${keyId} not found`);
      throw new Error('Key selection failed');
    }
    
    // Update usage info
    keyInfo.lastUsed = new Date();
    const stats = this.stats.get(keyId);
    stats.totalRequests++;
    stats.lastUsed = keyInfo.lastUsed;
    const startTime = Date.now();
    
    logger.debug(`Selected API key: ${keyId}`);
    
    // Return key with metadata for tracking
    return {
      id: keyId,
      key: keyInfo.key,
      startTime
    };
  }

  /**
   * Mark a key as successfully used
   * @param {string} keyId - Key ID
   * @param {Object} response - Response information
   */
  markSuccess(keyId, response = {}) {
    const keyInfo = this.keys.get(keyId);
    const stats = this.stats.get(keyId);
    
    if (keyInfo && stats) {
      // Reset failure count on success
      keyInfo.failures = 0;
      keyInfo.lastFailure = null;
      
      // Update stats
      stats.successfulRequests++;
      if (response.duration) {
        stats.responseTime.push(response.duration);
        // Keep only last 100 response times
        if (stats.responseTime.length > 100) {
          stats.responseTime = stats.responseTime.slice(-100);
        }
      }
      
      // Ensure key is in active list
      if (!this.activeKeys.includes(keyId)) {
        this.activeKeys.push(keyId);
        this.failedKeys.delete(keyId);
        logger.info(`Key ${keyId} recovered and returned to active pool`);
      }
      
      logger.debug(` Marked key ${keyId} as successful`);
    }
  }

  /**
   * Mark a key as failed
   * @param {string} keyId - Key ID
   * @param {Error} error - Error information
   */
  markFailure(keyId, error = {}) {
    const keyInfo = this.keys.get(keyId);
    const stats = this.stats.get(keyId);
    
    if (keyInfo && stats) {
      keyInfo.failures++;
      keyInfo.lastFailure = new Date();
      
      // Update stats
      stats.failedRequests++;
      
      // Remove from active keys if too many failures
      if (keyInfo.failures >= 3) {
        const index = this.activeKeys.indexOf(keyId);
        if (index > -1) {
          this.activeKeys.splice(index, 1);
          this.failedKeys.set(keyId, {
            failureCount: keyInfo.failures,
            lastFailure: keyInfo.lastFailure,
            error: error.message || 'Unknown error'
          });
          
          logger.warn(`Key ${keyId} temporarily disabled due to ${keyInfo.failures} failures`);
        }
      }
      
      logger.debug(`Marked key ${keyId} as failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Get active key information for strategy selection
   * @returns {Array} Array of active key objects
   */
  getActiveKeyInfos() {
    return this.activeKeys.map(keyId => {
      const keyInfo = this.keys.get(keyId);
      return {
        id: keyId,
        weight: keyInfo.weight,
        failures: keyInfo.failures,
        lastUsed: keyInfo.lastUsed
      };
    });
  }

  /**
   * Get statistics for all keys
   * @returns {Object} Statistics object
   */
  getStats() {
    const result = {
      totalKeys: this.keys.size,
      activeKeys: this.activeKeys.length,
      failedKeys: this.failedKeys.size,
      keys: {}
    };
    
    this.keys.forEach((keyInfo, keyId) => {
      const stats = this.stats.get(keyId);
      const avgResponseTime = stats.responseTime.length > 0 
        ? stats.responseTime.reduce((a, b) => a + b, 0) / stats.responseTime.length 
        : 0;
      
      result.keys[keyId] = {
        status: this.activeKeys.includes(keyId) ? 'active' : 'failed',
        failures: keyInfo.failures,
        totalRequests: stats.totalRequests,
        successfulRequests: stats.successfulRequests,
        failedRequests: stats.failedRequests,
        successRate: stats.totalRequests > 0 
          ? (stats.successfulRequests / stats.totalRequests * 100).toFixed(2) + '%' 
          : '0%',
        avgResponseTime: avgResponseTime.toFixed(2) + 'ms',
        lastUsed: stats.lastUsed ? stats.lastUsed.toISOString() : null
      };
    });
    
    return result;
  }

  /**
   * Add a new API key
   * @param {string} key - API key
   * @param {Object} options - Additional options
   * @returns {string} Key ID
   */
  addKey(key, options = {}) {
    const { weight = 1, enabled = true } = options;
    const id = options.id || `key_${key.slice(-8)}`;
    
    if (this.keys.has(id)) {
      throw new Error(`Key with ID ${id} already exists`);
    }
    
    this.keys.set(id, {
      id,
      key,
      weight,
      enabled,
      failures: 0,
      lastUsed: null,
      lastFailure: null
    });
    
    if (enabled) {
      this.activeKeys.push(id);
    }
    
    this.stats.set(id, {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      lastUsed: null,
      responseTime: []
    });
    
    logger.info(`Added new API key: ${id}`);
    return id;
  }

  /**
   * Remove an API key
   * @param {string} keyId - Key ID
   * @returns {boolean} Success status
   */
  removeKey(keyId) {
    if (!this.keys.has(keyId)) {
      return false;
    }
    
    this.keys.delete(keyId);
    this.stats.delete(keyId);
    this.failedKeys.delete(keyId);
    
    // Remove from active keys
    const index = this.activeKeys.indexOf(keyId);
    if (index > -1) {
      this.activeKeys.splice(index, 1);
    }
    
    logger.info(`Removed API key: ${keyId}`);
    return true;
  }

  /**
   * Enable a disabled key
   * @param {string} keyId - Key ID
   * @returns {boolean} Success status
   */
  enableKey(keyId) {
    const keyInfo = this.keys.get(keyId);
    if (!keyInfo) {
      return false;
    }
    
    if (!keyInfo.enabled) {
      keyInfo.enabled = true;
      keyInfo.failures = 0; // Reset failures on enable
      
      if (!this.activeKeys.includes(keyId)) {
        this.activeKeys.push(keyId);
      }
      
      logger.info(`Enabled API key: ${keyId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Disable a key
   * @param {string} keyId - Key ID
   * @returns {boolean} Success status
   */
  disableKey(keyId) {
    const keyInfo = this.keys.get(keyId);
    if (!keyInfo) {
      return false;
    }
    
    keyInfo.enabled = false;
    
    // Remove from active keys
    const index = this.activeKeys.indexOf(keyId);
    if (index > -1) {
      this.activeKeys.splice(index, 1);
    }
    
    logger.info(`Disabled API key: ${keyId}`);
    return true;
  }

  /**
   * Start recovery timer to check failed keys
   */
  startRecoveryTimer() {
    // Check every 5 minutes
    setInterval(() => {
      this.checkFailedKeys();
    }, 5 * 60 * 1000);
  }

  /**
   * Check and potentially recover failed keys
   */
  checkFailedKeys() {
    const now = new Date();
    const recoverAfter = 10 * 60 * 1000; // 10 minutes
    
    this.failedKeys.forEach((failureInfo, keyId) => {
      if (now - failureInfo.lastFailure > recoverAfter) {
        // Reset failures and try to recover
        const keyInfo = this.keys.get(keyId);
        if (keyInfo) {
          keyInfo.failures = 0;
          keyInfo.lastFailure = null;
          
          if (!this.activeKeys.includes(keyId)) {
            this.activeKeys.push(keyId);
          }
          
          this.failedKeys.delete(keyId);
          logger.info(`Auto-recovered key: ${keyId}`);
        }
      }
    });
  }
}

module.exports = ApiKeyManager;