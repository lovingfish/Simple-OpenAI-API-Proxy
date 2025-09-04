# GitHub 仓库创建和快速部署指南

## 🚀 5分钟快速开始

### 第一步：创建 GitHub 仓库

1. **访问 GitHub**
   - 打开 [github.com](https://github.com) 并登录

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 填写仓库信息：
     - **Repository name**: `openai-api-proxy`
     - **Description**: `OpenAI API reverse proxy service`
     - 选择 **Public**（公开）
     - **不要**勾选任何初始化选项

3. **创建仓库**
   - 点击 "Create repository"

### 第二步：上传代码到 GitHub

#### 方法一：使用 GitHub CLI（最简单）

```bash
# 安装 GitHub CLI（如果还没有）
# Windows: winget install GitHub.cli
# macOS: brew install gh
# 或下载：https://github.com/cli/cli/releases

# 登录 GitHub
gh auth login

# 在项目目录初始化并推送
cd X:\Projcet\TokenCounters
gh repo create openai-api-proxy --public --source=. --remote=origin --push
```

#### 方法二：手动上传（网页端）

1. **在当前文件夹打开终端**
   ```bash
   cd X:\Projcet\TokenCounters
   ```

2. **初始化 Git 并提交**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OpenAI API Proxy v1.0"
   ```

3. **连接远程仓库**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/openai-api-proxy.git
   git branch -M main
   git push -u origin main
   ```
   将 `YOUR_USERNAME` 替换成你的 GitHub 用户名。

#### 方法三：压缩包上传

1. **创建压缩包**
   - 将项目文件夹中的所有文件压缩为 zip
   - 不包括 node_modules 文件夹

2. **上传到 GitHub**
   - 在仓库页面点击 "uploading an existing file"
   - 拖拽或上传 zip 文件
   - GitHub 会自动解压

### 第三步：一键部署到 Render

1. **获取 Render 一键部署链接**
   - 复制以下链接：
   ```
   https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/openai-api-proxy
   ```
   将 `YOUR_USERNAME` 替换成你的 GitHub 用户名。

2. **部署到 Render**
   - 打开上述链接
   - 使用 GitHub 账号登录 Render
   - 填写环境变量：
     - **Name**: `OPENAI_API_KEY`
     - **Value**: 你的 OpenAI API 密钥（从 https://platform.openai.com/ 获取）
   - 点击 "Create Web Service"

3. **等待部署完成**
   - Render 会自动构建和部署
   - 通常需要 2-3 分钟

4. **获取代理地址**
   - 部署成功后，你会得到一个 `.onrender.com` 结尾的域名
   - 这个域名就是你的代理地址

### 第四步：测试代理

使用 cURL 测试：

```bash
# 替换成你的代理地址和 API Key
curl -X POST https://your-service-name.onrender.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-openai-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### 🔧 常见问题

**Q: 提示 "repository not found"**
- 确认仓库名和用户名正确
- 确保仓库是 Public 的

**Q: 推送失败**
- 检查网络连接
- 确认已正确输入 GitHub 密码或 token

**Q: Render 部署失败**
- 检查 OPENAI_API_KEY 是否正确
- 查看 Render 日志排查问题

**Q: 如何获取 OpenAI API Key？**
1. 访问 https://platform.openai.com/
2. 注册/登录账号
3. 点击 "API keys"
4. 点击 "Create new secret key"

### 🎉 恭喜！

你已经成功部署了 OpenAI API 代理！现在你可以：

- 在任何应用中使用你的代理地址
- 访问 OpenAI API 而无需担心网络问题
- 享受 Render 免费套餐的稳定服务

需要帮助？查看项目的完整文档或提交 Issue！