/**
 * Utility functions for the OpenAI API Proxy
 */

/**
 * Validate OpenAI API key format
 * @param {string} key - API key to validate
 * @returns {boolean}
 */
function isValidApiKey(key) {
  return typeof key === 'string' && key.startsWith('sk-') && key.length > 20;
}

/**
 * Generate a random ID
 * @param {number} length - Length of ID (default: 8)
 * @returns {string}
 */
function generateId(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Simple logger with timestamp
 */
const logger = {
  info: (message, data = {}) => {
    console.log(`[${new Date().toISOString()}] INFO: ${message}`, data);
  },
  warn: (message, data = {}) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}`, data);
  },
  error: (message, data = {}) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, data);
  },
  debug: (message, data = {}) => {
    if (process.env.DEBUG === 'true') {
      console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, data);
    }
  }
};

module.exports = {
  isValidApiKey,
  generateId,
  sleep,
  logger
};