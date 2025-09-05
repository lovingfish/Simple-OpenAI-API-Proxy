const { logger } = require('../utils/helpers');

/**
 * Round Robin Load Balancing Strategy
 * Distributes requests sequentially across available API keys
 */
class RoundRobinStrategy {
  constructor(options = {}) {
    this.currentIndex = 0;
    this.options = {
      skipFailedKeys: options.skipFailedKeys !== false, // Skip failed keys by default
      ...options
    };
    
    logger.debug('RoundRobin strategy initialized');
  }

  /**
   * Select next key using round robin algorithm
   * @param {Array} keys - Array of key objects with { id, weight, failures }
   * @returns {string} Selected key ID
   */
  select(keys) {
    if (!keys || keys.length === 0) {
      throw new Error('No keys available for selection');
    }

    // Filter out failed keys if option is enabled
    let availableKeys = keys;
    if (this.options.skipFailedKeys) {
      availableKeys = keys.filter(key => {
        // Consider key failed if it has 3 or more failures
        return !key.failures || key.failures < 3;
      });
      
      // If all keys have failed, use all keys
      if (availableKeys.length === 0) {
        availableKeys = keys;
        logger.warn('All keys have failures, using all keys');
      }
    }

    if (availableKeys.length === 0) {
      throw new Error('No available keys after filtering');
    }

    // Handle weighted round robin
    if (this.hasWeights(availableKeys)) {
      return this.selectWeighted(availableKeys);
    }

    // Simple round robin
    const selectedIndex = this.currentIndex % availableKeys.length;
    const selectedKey = availableKeys[selectedIndex].id;
    
    // Move to next key
    this.currentIndex = (this.currentIndex + 1) % availableKeys.length;
    
    logger.debug(`RoundRobin selected key: ${selectedKey} (index: ${selectedIndex})`);
    
    return selectedKey;
  }

  /**
   * Check if keys have different weights
   * @param {Array} keys - Array of key objects
   * @returns {boolean}
   */
  hasWeights(keys) {
    if (!keys || keys.length === 0) return false;
    
    const firstWeight = keys[0].weight || 1;
    return keys.some(key => (key.weight || 1) !== firstWeight);
  }

  /**
   * Select key considering weights
   * @param {Array} keys - Array of key objects
   * @returns {string} Selected key ID
   */
  selectWeighted(keys) {
    // Create weighted list
    const weightedKeys = [];
    keys.forEach(key => {
      const weight = key.weight || 1;
      for (let i = 0; i < weight; i++) {
        weightedKeys.push(key.id);
      }
    });

    // Use round robin on weighted list
    const selectedIndex = this.currentIndex % weightedKeys.length;
    const selectedKey = weightedKeys[selectedIndex];
    
    // Move to next position
    this.currentIndex = (this.currentIndex + 1) % weightedKeys.length;
    
    logger.debug(`Weighted RoundRobin selected key: ${selectedKey} (index: ${selectedIndex})`);
    
    return selectedKey;
  }

  /**
   * Reset the round robin index
   */
  reset() {
    this.currentIndex = 0;
    logger.debug('RoundRobin index reset');
  }

  /**
   * Get current index
   * @returns {number}
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * Set current index
   * @param {number} index - New index
   */
  setCurrentIndex(index) {
    this.currentIndex = Math.max(0, index);
    logger.debug(`RoundRobin index set to ${this.currentIndex}`);
  }

  /**
   * Get strategy information
   * @returns {Object}
   */
  getInfo() {
    return {
      name: 'RoundRobin',
      currentIndex: this.currentIndex,
      options: this.options
    };
  }
}

module.exports = RoundRobinStrategy;