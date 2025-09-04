// OpenAI API Proxy Server for Render
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Import v2.0 multi-account components
const ConfigManager = require('./src/config/ConfigManager');
const ApiKeyManager = require('./src/managers/ApiKeyManager');
const RoundRobinStrategy = require('./src/strategies/RoundRobin');
const { createLoadBalancerMiddleware } = require('./src/managers/LoadBalancerMiddleware');
const { logger } = require('./src/utils/helpers');

const app = express();
const PORT = process.env.PORT || 10000;

// Initialize configuration and multi-account components
let apiKeyManager = null;
let loadBalancerMiddleware = null;

try {
  // Load configuration
  const configManager = new ConfigManager();
  const config = configManager.getConfig();
  
  // Validate configuration
  const validation = configManager.validate();
  if (!validation.valid) {
    logger.error('Configuration validation failed:', validation.errors);
    throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
  }
  
  // Initialize multi-account mode if multiple keys are configured
  if (configManager.hasMultipleKeys()) {
    logger.info('Initializing multi-account mode');
    
    // Initialize strategy
    const strategy = new RoundRobinStrategy({
      skipFailedKeys: true
    });
    
    // Initialize API key manager
    apiKeyManager = new ApiKeyManager(config, strategy);
    
    // Create load balancer middleware
    loadBalancerMiddleware = createLoadBalancerMiddleware(apiKeyManager);
    
    logger.info(`Multi-account mode enabled with ${config.keys.length} API keys`);
    console.log(`✨ Multi-account mode: ${config.keys.length} API keys loaded`);
  } else {
    logger.info('Single key mode enabled');
    console.log(`🔑 Single key mode enabled`);
  }
  
} catch (error) {
  logger.error('Failed to initialize configuration:', error.message);
  console.error('Configuration error:', error.message);
  process.exit(1);
}

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源，生产环境可以限制
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

// Apply load balancer middleware in multi-key mode
if (loadBalancerMiddleware) {
  app.use(loadBalancerMiddleware);
}

// 健康检查端点
app.get('/health', (req, res) => {
  const healthData = {
    status: 'ok',
    message: 'OpenAI API Proxy is running',
    version: '2.0.0',
    mode: loadBalancerMiddleware ? 'multi-key' : 'single-key'
  };
  
  // Add multi-key stats if available
  if (apiKeyManager) {
    const stats = apiKeyManager.getStats();
    healthData.stats = {
      totalKeys: stats.totalKeys,
      activeKeys: stats.activeKeys,
      failedKeys: stats.failedKeys
    };
  }
  
  res.json(healthData);
});

// 统计信息端点 (仅多key模式)
if (apiKeyManager) {
  app.get('/api/stats', (req, res) => {
    const stats = apiKeyManager.getStats();
    res.json(stats);
  });
  
  // 配置信息端点
  app.get('/api/config', (req, res) => {
    const configInfo = {
      mode: loadBalancerMiddleware ? 'multi-key' : 'single-key',
      strategy: loadBalancerMiddleware ? 'roundrobin' : 'none'
    };
    res.json(configInfo);
  });
}

// API 路由代理
app.use('/v1', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: {},
  onProxyReq: (proxyReq, req, res) => {
    // In multi-key mode, authorization header is already set by load balancer
    // In single-key mode, set it here
    if (!loadBalancerMiddleware) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('OPENAI_API_KEY is not configured');
        res.status(500).json({ error: 'API key not configured' });
        return;
      }
      proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
    }
    
    proxyReq.setHeader('User-Agent', 'OpenAI-Proxy/2.0');
    
    // Log key usage info if available
    if (req.selectedApiKey) {
      console.log(`[${new Date().toISOString()}] Proxying with key ${req.selectedApiKey.id}: ${proxyReq.path}`);
    } else {
      console.log(`[${new Date().toISOString()}] Proxying to: ${proxyReq.path}`);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // 记录响应状态
    console.log(`[${new Date().toISOString()}] Response status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[${new Date().toISOString()}] Proxy error:`, err);
    
    // 如果代理出错，返回错误信息
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Proxy error',
        message: err.message
      });
    }
  },
  timeout: 300000, // 5分钟超时
  proxyTimeout: 300000,
  followRedirects: true,
  secure: true,
  xfwd: true
}));

// 代理所有其他请求到 OpenAI
app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // Same logic as above - check if in multi-key mode
    if (!loadBalancerMiddleware) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error('OPENAI_API_KEY is not configured');
        res.status(500).json({ error: 'API key not configured' });
        return;
      }
      proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
    }
    
    proxyReq.setHeader('User-Agent', 'OpenAI-Proxy/2.0');
  },
  timeout: 300000,
  proxyTimeout: 300000
}));

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Please use /v1/... endpoints for OpenAI API calls'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 OpenAI API Proxy server v2.0.0 is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/v1`);
  
  if (apiKeyManager) {
    console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
    console.log(`⚙️  Config endpoint: http://localhost:${PORT}/api/config`);
  }
});

module.exports = app;