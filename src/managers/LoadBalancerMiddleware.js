const { logger } = require('../utils/helpers');

/**
 * Load Balancer Middleware for Express
 * Handles API key selection and injection for multi-key mode
 */
function createLoadBalancerMiddleware(apiKeyManager) {
  return function loadBalancerMiddleware(req, res, next) {
    // Store original authorization header for potential restoration
    const originalAuth = req.headers.authorization;
    
    try {
      // Get next API key
      const keyInfo = apiKeyManager.getNextKey();
      
      // Store key info on request for later use
      req.selectedApiKey = keyInfo;
      
      // Inject API key into authorization header
      req.headers.authorization = `Bearer ${keyInfo.key}`;
      
      // Override res.end to capture response status
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        // Calculate response duration
        const duration = Date.now() - keyInfo.startTime;
        
        // Determine success/failure based on status code
        if (res.statusCode >= 200 && res.statusCode < 500) {
          // Success (2xx, 3xx, 4xx)
          apiKeyManager.markSuccess(keyInfo.id, { duration });
          logger.debug(`Request successful with key ${keyInfo.id}: ${res.statusCode} (${duration}ms)`);
        } else {
          // Server error (5xx)
          const error = new Error(`HTTP ${res.statusCode}`);
          apiKeyManager.markFailure(keyInfo.id, error);
          logger.warn(`Request failed with key ${keyInfo.id}: ${res.statusCode} (${duration}ms)`);
        }
        
        // Call original end
        originalEnd.call(this, chunk, encoding);
      };
      
      // Handle response errors
      res.on('error', (error) => {
        const duration = Date.now() - keyInfo.startTime;
        apiKeyManager.markFailure(keyInfo.id, error);
        logger.error(`Response error with key ${keyInfo.id}: ${error.message} (${duration}ms)`);
      });
      
      // Handle request errors
      req.on('error', (error) => {
        const duration = Date.now() - keyInfo.startTime;
        apiKeyManager.markFailure(keyInfo.id, error);
        logger.error(`Request error with key ${keyInfo.id}: ${error.message} (${duration}ms)`);
      });
      
      logger.debug(`Using API key ${keyInfo.id} for ${req.method} ${req.path}`);
      
    } catch (error) {
      // Failed to get API key
      logger.error('Load balancer error:', error.message);
      
      // Restore original auth header
      if (originalAuth) {
        req.headers.authorization = originalAuth;
      }
      
      // For API routes, return error
      if (req.path.startsWith('/v1/')) {
        return res.status(503).json({
          error: {
            message: 'Service temporarily unavailable',
            type: 'load_balancer_error',
            details: error.message
          }
        });
      }
    }
    
    next();
  };
}

/**
 * Alternative middleware for proxy-based implementations
 * Uses proxy events instead of overriding res.end
 */
function createProxyLoadBalancerMiddleware(apiKeyManager) {
  return function proxyLoadBalancerMiddleware(req, res, next) {
    try {
      // Get next API key
      const keyInfo = apiKeyManager.getNextKey();
      
      // Store key info on request
      req.selectedApiKey = keyInfo;
      
      // Inject API key
      req.headers.authorization = `Bearer ${keyInfo.key}`;
      
      // Setup proxy response listener (will be attached later by proxy middleware)
      req.once('proxyResponse', (proxyRes) => {
        const duration = Date.now() - keyInfo.startTime;
        
        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 500) {
          apiKeyManager.markSuccess(keyInfo.id, { duration });
        } else {
          const error = new Error(`HTTP ${proxyRes.statusCode}`);
          apiKeyManager.markFailure(keyInfo.id, error);
        }
      });
      
      // Handle proxy errors
      req.once('proxyError', (error) => {
        const duration = Date.now() - keyInfo.startTime;
        apiKeyManager.markFailure(keyInfo.id, error);
      });
      
    } catch (error) {
      logger.error('Proxy load balancer error:', error.message);
      
      if (req.path.startsWith('/v1/')) {
        return res.status(503).json({
          error: {
            message: 'Service temporarily unavailable',
            type: 'load_balancer_error',
            details: error.message
          }
        });
      }
    }
    
    next();
  };
}

module.exports = {
  createLoadBalancerMiddleware,
  createProxyLoadBalancerMiddleware
};