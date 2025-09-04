# OpenAI API Proxy

![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)

一个运行在 Render 上的 OpenAI API 反向代理服务，解决网络访问问题，提供稳定、快速的代理服务。

## ✨ 特性

- 🚀 **无超时限制** - Render Web Service 支持长时间运行的 GPT-4 请求
- 🔒 **安全鉴权** - 支持 API Key 认证
- 📊 **请求日志** - 完整的访问和错误日志
- 💰 **免费部署** - Render 免费套餐足够个人使用
- 🎯 **开箱即用** - 一键部署，5分钟上线

## 🚀 一键部署到 Render

点击下方按钮，自动部署到 Render：

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/openai-api-proxy)

**部署步骤：**
1. 点击上方按钮
2. 使用 GitHub 账号登录 Render
3. 填写 `OPENAI_API_KEY` 环境变量（从 https://platform.openai.com/ 获取）
4. 点击 "Create Web Service"
5. 等待部署完成（2-3分钟）

## 📖 使用方法

部署成功后，使用你的 Render 域名替换原 API 地址。

### JavaScript 示例

```javascript
const response = await fetch('https://your-service-name.onrender.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ]
  })
});

const data = await response.json();
console.log(data);
```

### Python 示例

```python
import requests

url = "https://your-service-name.onrender.com/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {OPENAI_API_KEY}"
}

data = {
    "model": "gpt-4",
    "messages": [
        {"role": "user", "content": "Hello, world!"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())
```

### cURL 示例

```bash
curl -X POST https://your-service-name.onrender.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## 🛠️ 本地开发

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装运行

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/openai-api-proxy.git
   cd openai-api-proxy
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 配置环境变量
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加你的 OPENAI_API_KEY
   ```

4. 启动服务
   ```bash
   npm start
   # 或使用开发模式
   npm run dev
   ```

服务将在 `http://localhost:10000` 运行

## 📋 API 端点

本代理支持所有 OpenAI API 端点：

- `GET /v1/models` - 获取模型列表
- `POST /v1/chat/completions` - 聊天完成
- `POST /v1/completions` - 文本完成
- `POST /v1/embeddings` - 词嵌入
- `POST /v1/images/generations` - 图像生成
- `POST /v1/audio/speech` - 语音转文本
- `GET /health` - 健康检查

## 📋 TODO 列表

### v1.0.0 - 已完成 ✅
- [x] 基础反向代理功能
- [x] Render 部署配置
- [x] 错误处理和日志
- [x] CORS 支持
- [x] 健康检查端点

### v2.0.0 - 计划中 📋
- [ ] **多账号轮询功能**
  - [ ] 支持多个 OpenAI API Key
  - [ ] 负载均衡策略（轮询、随机、权重）
  - [ ] 失败自动切换
  - [ ] API Key 状态监控
  - [ ] 使用量统计和配额管理
- [ ] 缓存功能
  - [ ] Redis 集成
  - [ ] 响应缓存策略
  - [ ] 缓存失效机制
- [ ] 高级功能
  - [ ] 请求速率限制
  - [ ] IP 白名单/黑名单
  - [ ] 自定义域名支持
  - [ ] 请求/响应日志分析
- [ ] 管理界面
  - [ ] Web 管理面板
  - [ ] 实时监控仪表板
  - [ ] API Key 管理页面
  - [ ] 使用统计图表

### v3.0.0 - 远期规划 🔮
- [ ] 多模型支持（Claude、Gemini 等）
- [ ] 流式响应优化
- [ ] 插件系统
- [ ] Docker 部署支持
- [ ] Kubernetes 配置

## ⚠️ 安全注意事项

1. **API Key 保护**
   - 不要将 API Key 提交到版本控制
   - 定期更新 API Key
   - 在 Render 中使用环境变量存储

2. **费用控制**
   - 监控 OpenAI API 使用量
   - 设置用量告警
   - 避免无限请求循环

3. **访问控制**
   - 生产环境建议添加认证
   - 可以配置 IP 白名单

## 🔧 故障排除

### 常见问题

1. **服务启动失败**
   - 检查 `OPENAI_API_KEY` 是否正确设置
   - 查看 Render 日志获取错误详情

2. **API 请求超时**
   - Render Web Service 无超时限制
   - 检查 OpenAI API 是否正常

3. **CORS 错误**
   - 确保正确设置请求头
   - 检查浏览器控制台错误信息

### 查看日志

访问 Render Dashboard → Logs 标签页，查看实时日志。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 🙏 致谢

- [OpenAI](https://openai.com/) - 强大的 AI API
- [Render](https://render.com/) - 优秀的部署平台

## 📞 支持

如果这个项目对您有帮助，请给个 ⭐️ 支持一下！

遇到问题？欢迎提交 [Issue](https://github.com/yourusername/openai-api-proxy/issues)