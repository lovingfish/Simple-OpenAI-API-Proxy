// OpenAI API Proxy Server for Render
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000;

// 中间件
app.use(cors({
  origin: '*', // 允许所有来源，生产环境可以限制
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'OpenAI API Proxy is running' });
});

// API 路由代理
app.use('/v1', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: {},
  onProxyReq: (proxyReq, req, res) => {
    // 添加 Authorization 头
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured');
      res.status(500).json({ error: 'API key not configured' });
      return;
    }
    
    proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
    proxyReq.setHeader('User-Agent', 'OpenAI-Proxy/1.0');
    
    console.log(`[${new Date().toISOString()}] Proxying to: ${proxyReq.path}`);
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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured');
      res.status(500).json({ error: 'API key not configured' });
      return;
    }
    
    proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
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
  console.log(`🚀 OpenAI API Proxy server is running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/v1`);
});

module.exports = app;