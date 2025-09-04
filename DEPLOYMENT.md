# 详细部署指南

## 目录
- [Railway 部署指南](#railway-部署指南)
- [Render 部署指南](#render-部署指南)
- [Oracle Cloud 部署指南](#oracle-cloud-部署指南)
- [Fly.io 部署指南](#flyio-部署指南)
- [Docker 本地部署](#docker-本地部署)

---

## Railway 部署指南 ⭐推荐

Railway 是最简单的部署方案，提供15分钟超时限制和$5/月免费额度。

### 前提条件
- GitHub 账号
- OpenAI API 密钥

### 部署步骤

#### 方法一：一键部署（推荐）

1. **点击 Railway 部署按钮**
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/openai-api-proxy&envs=OPENAI_API_KEY)

2. **连接 GitHub 账号**
   - 使用 GitHub 登录 Railway
   - 授权 Railway 访问你的 GitHub

3. **配置环境变量**
   - 变量名：`OPENAI_API_KEY`
   - 值：你的 OpenAI API 密钥（格式：`sk-...`）

4. **部署**
   - 点击 Deploy
   - 等待部署完成（约2-3分钟）

5. **获取代理地址**
   - 部署完成后，Railway 会提供一个 `.railway.app` 结尾的域名
   - 这个域名就是你的代理地址

#### 方法二：通过 GitHub 导入

1. **Fork 本仓库**
   - 访问本仓库页面
   - 点击右上角 Fork 按钮

2. **在 Railway 创建新项目**
   - 登录 [railway.app](https://railway.app)
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你 Fork 的仓库

3. **配置环境变量**
   - 在项目设置中，点击 "Variables"
   - 添加变量：
     ```
     Name: OPENAI_API_KEY
     Value: sk-your-openai-api-key
     ```

4. **启动部署**
   - Railway 会自动检测 Node.js 项目并部署
   - 查看部署日志确保无错误

### 使用你的代理

```bash
# 示例：使用你的 Railway 代理地址
curl -X POST https://your-app-name.railway.app/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Railway 使用提示

- **免费额度**：每月$5，通常足够个人使用
- **监控**：在 Railway Dashboard 可以查看使用情况
- **日志**：点击 "Logs" 查看详细的请求日志
- **自定义域名**：在 Settings → Domains 可以绑定自己的域名

---

## Render 部署指南

Render 提供无超时限制的 Web 服务，有免费套餐。

### 前提条件
- GitHub 账号
- OpenAI API 密钥

### 部署步骤

#### 1. 准备 GitHub 仓库

1. **Fork 本仓库**
   ```bash
   # 访问仓库页面点击 Fork，或使用命令行
   gh repo fork yourusername/openai-api-proxy
   ```

#### 2. 在 Render 创建服务

1. **注册/登录 Render**
   - 访问 [render.com](https://render.com)
   - 使用 GitHub 账号登录

2. **创建新服务**
   - 点击 Dashboard 右上角的 "New +"
   - 选择 "Web Service"

3. **连接代码仓库**
   - 选择 "Build and deploy from a Git repository"
   - 选择你 Fork 的仓库
   - 选择分支（通常是 main）

#### 3. 配置服务

1. **基础配置**
   - Name: `openai-proxy`（可自定义）
   - Region: 选择离你最近的区域
   - Branch: `main`

2. **环境变量**
   - 在 "Environment" 部分，添加变量：
     ```
     Key: OPENAI_API_KEY
     Value: sk-your-openai-api-key
     ```

3. **构建命令**
   - Build Command: `npm install`
   - Start Command: `node index.js`

4. **实例类型**
   - 选择 "Free"（免费套餐）

#### 4. 部署服务

1. **点击 "Create Web Service"**
2. 等待构建和部署（约3-5分钟）
3. 查看日志确保部署成功

#### 5. 获取服务地址

部署完成后，Render 会提供一个 `.onrender.com` 结尾的域名，这 就是你的代理地址。

### 使用你的代理

```javascript
// 在代码中使用
const OPENAI_API_BASE_URL = 'https://your-service-name.onrender.com/v1';
```

### Render 使用提示

- **免费套餐限制**：
  - 512 MB RAM
  - 共享 CPU
  - 每月 750 小时
  - 无请求超时限制 ⭐

- **监控**：
  - 在 Dashboard 可以查看 CPU、内存使用情况
  - Logs 标签页查看访问日志

- **自动休眠**：
  - 免费套餐 15 分钟无访问会自动休眠
  - 再次访问时会自动唤醒（可能有1-2分钟延迟）

---

## Oracle Cloud 部署指南

Oracle Cloud Always Free 提供永久免费的 ARM 实例。

### 前提条件
- 信用卡（用于验证，不会被实际收费）
- 基本的 Linux 命令行知识

### 部署步骤

#### 1. 注册 Oracle Cloud

1. **注册账号**
   - 访问 [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
   - 点击 "Try Free"
   - 填写注册信息（需要信用卡验证）

2. **创建租户**
   - 注册成功后创建云租户
   - 等待账号激活（通常几分钟）

#### 2. 创建计算实例

1. **登录控制台**
   - 访问 [Oracle Cloud Console](https://console.oracle-cloud.com)
   - 使用注册的账号登录

2. **导航到计算实例**
   - 左上角菜单 → Compute → Instances

3. **创建实例**
   - 点击 "Create Instance"
   - 配置实例详情：
     - Name: `openai-proxy`
     - Compartment: 选择你的 compartment
     - Choose an image: 选择 **Canonical Ubuntu 22.04**
     - Shape: 选择 **VM.Standard.E2.1.Micro**（Always Free）
     - SSH key: 上传你的 SSH 公钥

4. **网络配置**
   - Virtual cloud network: 创建新的 VCN
   - Subnet: 使用默认配置
   - 添加 ingress 规则：
     - Source Type: CIDR
     - Source CIDR: 0.0.0.0/0
     - Destination Port Range: 3000
     - Protocol: TCP

5. **创建实例**
   - 点击 "Create"
   - 等待实例创建完成（约2-3分钟）

#### 3. 连接到实例

1. **获取公共 IP**
   - 在实例详情页找到 Public IP Address

2. **SSH 连接**
   ```bash
   ssh ubuntu@<your-instance-public-ip>
   ```

#### 4. 部署代理服务

1. **更新系统并安装依赖**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **克隆代码**
   ```bash
   git clone https://github.com/yourusername/openai-api-proxy.git
   cd openai-api-proxy
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   ```bash
   echo "export OPENAI_API_KEY=sk-your-openai-api-key" >> ~/.bashrc
   source ~/.bashrc
   ```

5. **启动服务**
   ```bash
   # 测试运行
   npm start
   
   # 或使用 PM2 长期运行
   sudo npm install -g pm2
   pm2 start index.js --name openai-proxy
   pm2 save
   pm2 startup
   ```

#### 5. 使用反向代理（可选）

使用 Nginx 反向代理，绑定域名：

```bash
# 安装 Nginx
sudo apt install nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/openai-proxy
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/openai-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 使用你的代理

```bash
# 使用实例IP
curl -X POST http://<your-instance-ip>:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Oracle Cloud 注意事项

- **免费资源限制**：
  - 2 个 AMD 实例 或 4 个 ARM 实例
  - 每月 10 TB 出站流量
  - 永久免费 ⭐

- **维护**：
  - 定期更新系统补丁
  - 监控资源使用情况
  - 备份重要数据

- **安全**：
  - 配置防火墙规则
  - 使用 SSH 密钥登录
  - 定期更新密码

---

## Fly.io 部署指南

Fly.io 是一个边缘计算平台，全球部署。

### 前提条件
- Fly.io 账号
- OpenAI API 密钥

### 部署步骤

#### 1. 安装 Fly CLI

```bash
# macOS
brew install flyctl

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Linux
curl -L https://fly.io/install.sh | sh
```

#### 2. 登录 Fly.io

```bash
flyctl auth login
```

#### 3. 初始化应用

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/openai-api-proxy.git
   cd openai-api-proxy
   ```

2. **创建 fly.toml**
   ```toml
   app = "openai-proxy"
   
   [build]
     builder = "paketobuildpacks/builder:base"
     
   [env]
     PORT = "8080"
     OPENAI_API_KEY = "sk-your-openai-api-key"
   
   [[services]]
     protocol = "tcp"
     internal_port = 8080
     
     [[services.ports]]
       handlers = ["http"]
       port = 80
       
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   ```

3. **部署**
   ```bash
   flyctl launch
   flyctl deploy
   ```

#### 4. 设置环境变量

```bash
flyctl secrets set OPENAI_API_KEY=sk-your-openai-api-key
```

### 使用你的代理

部署完成后，Fly.io 会提供一个 `.fly.dev` 域名。

---

## Docker 本地部署

### 前提条件
- Docker 和 Docker Compose

### 部署步骤

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

#### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  openai-proxy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=sk-your-openai-api-key
    restart: unless-stopped
```

#### 3. 启动服务

```bash
docker-compose up -d
```

#### 4. 使用 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 故障排除

### 常见问题

1. **ECONNRESET 错误**
   - 检查网络连接
   - 确认代理服务正在运行
   - 尝试更换部署区域

2. **429 Too Many Requests**
   - 检查 OpenAI API 使用量
   - 考虑升级 API Key 或限制请求频率

3. **服务启动失败**
   - 查看容器/服务日志
   - 确认环境变量配置正确
   - 检查 Node.js 版本兼容性

### 监控和日志

- **Railway**: Dashboard → Logs
- **Render**: Dashboard → Logs
- **Oracle Cloud**: Instance → Console
- **Fly.io**: `flyctl logs`

## 安全建议

1. **API Key 保护**
   - 定期轮换 API Key
   - 监控使用量
   - 设置告警阈值

2. **访问控制**
   - 使用 HTTPS
   - 添加访问认证
   - 限制访问 IP

3. **成本控制**
   - 设置 OpenAI 使用限制
   - 监控请求量
   - 避免无限循环请求