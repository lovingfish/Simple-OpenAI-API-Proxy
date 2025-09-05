const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Vercel a a body parser for the proxy
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'OpenAI API Proxy is running',
    version: '1.0.0'
  });
});

// 代理所有请求到OpenAI - 直接转发，不改Authorization
app.use('/', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('User-Agent', 'OpenAI-Proxy/1.0');
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error', message: err.message });
    }
  },
  timeout: 300000,
  proxyTimeout: 300000
}));

module.exports = app;