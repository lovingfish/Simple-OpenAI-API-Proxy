# OpenAI API 反向代理部署完全指南

## 📖 目录
- [方案对比：Vercel/Netlify vs 自己的服务器](#方案对比vercelnetlify-vs-自己的服务器)
- [方案一：Vercel Serverless 函数代理](#方案一vercel-serverless-函数代理)
- [方案二：Netlify 函数代理](#方案二netlify-函数代理)
- [方案三：WSL2 + Docker 部署](#方案三wsl2--docker-部署)
- [常见问题解答](#常见问题解答)
- [安全注意事项](#安全注意事项)

---

## 方案对比：Vercel/Netlify vs 自己的服务器

### 🎯 各方案特点

| 部署方式 | 优点 | 缺点 | 适合人群 |
|---------|------|------|----------|
| **Vercel** | 免费额度、自动HTTPS、全球CDN、零配置 | 有请求超时限制(10秒)、响应可能较慢 | 新手、小规模使用 |
| **Netlify** | 免费额度、自动HTTPS、边缘计算 | 同样有超时限制、配置稍复杂 | 喜欢Netlify的用户 |
| **自己的服务器** | 完全控制、无超时限制、性能最佳 | 需要技术维护、成本较高 | 有运维经验的用户 |

### 🤔 如何选择？

- **选择 Vercel/Netlify 如果：**
  - 你是新手，不想配置服务器
  - 预算有限，想使用免费服务
  - API调用频率不高（每天几百次）
  - 不介意偶尔的延迟

- **选择自己服务器如果：**
  - 需要稳定、高速的API访问
  - API调用频率很高
  - 需要处理大请求或长时间响应
  - 有并发访问需求

---

## 方案一：Vercel Serverless 函数代理

### 🛠️ 准备工作

1. **GitHub账号**
   - 访问 github.com 注册
   - 代码将通过Git管理

2. **Vercel账号**
   - 访问 vercel.com 注册
   - 使用GitHub账号登录（方便部署）

3. **OpenAI API密钥**
   - 访问 https://platform.openai.com/
   - 注册账号并创建API密钥

### 📝 详细步骤

#### 第1步：创建项目文件夹

```bash
# 在你的电脑上创建项目文件夹
mkdir openai-vercel-proxy
cd openai-vercel-proxy
```

#### 第2步：初始化项目

```bash
# 使用npm初始化项目
npm init -y

# 安装需要的依赖
npm install dotenv
```

#### 第3步：创建API路由

在项目根目录创建文件夹结构：
```
openai-vercel-proxy/
├── api/
│   └── proxy/
│       └── route.js    # API处理函数
├── .env                 # 环境变量
├── .env.local          # 本地环境变量（不提交到Git）
├── package.json
├── vercel.json         # Vercel配置
└── README.md
```

#### 第4步：编写API代理代码

创建 `api/proxy/route.js` 文件：

```javascript
export async function POST(request) {
  try {
    // 获取请求头和请求体
    const headers = Object.fromEntries(request.headers.entries());
    const body = await request.json();
    
    // 验证OpenAI API Key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500 }
      );
    }
    
    // 构建转发请求
    const proxyHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
      'User-Agent': `${headers['user-agent'] || 'OpenAI-Proxy'}`
    };
    
    // 转发请求到OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: proxyHeaders,
      body: JSON.stringify(body)
    });
    
    // 返回OpenAI的响应
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

// 支持OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
```

#### 第5步：配置Vercel

创建 `vercel.json` 文件：

```json
{
  "functions": {
    "api/proxy/route.js": {
      "maxDuration": 10
    }
  },
  "env": {
    "OPENAI_API_KEY": "@openai_api_key"
  }
}
```

#### 第6步：设置环境变量

创建 `.env` 文件（模板）：
```
# OpenAI API密钥
OPENAI_API_KEY=your_openai_api_key_here
```

创建 `.env.local` 文件（本地使用，不需要提交到Git）：
```
OPENAI_API_KEY=sk-你的真实密钥
```

#### 第7步：创建 .gitignore 文件

```
# 依赖
node_modules/

# 环境变量
.env.local
.env.*.local

# 日志
npm-debug.log*
```

#### 第8步：部署到Vercel

**方法A：通过GitHub部署（推荐）**

1. **上传代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   
   # 在GitHub创建新仓库，然后执行
   git remote add origin https://github.com/你的用户名/openai-vercel-proxy.git
   git push -u origin main
   ```

2. **在Vercel导入项目**
   - 登录 vercel.com
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 在环境变量设置中添加：
     - Name: `OPENAI_API_KEY`
     - Value: 你的OpenAI API密钥
   - 点击 Deploy

**方法B：通过Vercel CLI部署**

1. **安装Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录并部署**
   ```bash
   vercel login
   vercel --prod
   ```

#### 第9步：使用代理

部署成功后，你会得到一个URL，如：`https://your-project.vercel.app`

使用方法：
```javascript
// 替换原来的API地址
// 原地址：https://api.openai.com/v1/chat/completions
// 新地址：https://your-project.vercel.app/api/proxy

const response = await fetch('https://your-project.vercel.app/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ]
  })
});
```

---

## 方案二：Netlify 函数代理

### 📝 详细步骤

#### 第1步：项目初始化

```bash
mkdir openai-netlify-proxy
cd openai-netlify-proxy
npm init -y
```

#### 第2步：创建文件夹结构

```
openai-netlify-proxy/
├── netlify/
│   └── functions/
│       └── proxy/
│           └── proxy.js   # Netlify函数
├── .env                 # 环境变量
└── package.json
```

#### 第3步：编写代理函数

创建 `netlify/functions/proxy/proxy.js`：

```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析请求体
    const body = JSON.parse(event.body);
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // 转发请求到OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'User-Agent': 'OpenAI-Proxy/Netlify'
      },
      body: JSON.stringify(body)
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers,
      body: data
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

#### 第4步：安装依赖

```bash
npm install node-fetch@2
```

#### 第5步：创建配置文件

创建 `netlify.toml`：

```toml
[build]
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### 第6步：设置环境变量

在Netlify控制台的 "Site settings" → "Build & deploy" → "Environment" 中添加：
- Key: `OPENAI_API_KEY`
- Value: 你的OpenAI API密钥

#### 第7步：部署

1. **Git初始化并推送**

```bash
git init
git add .
git commit -m "Initial commit"

# 在Netlify创建新站点，连接GitHub仓库
```

2. **Netlify会自动部署**

部署成功后，使用方法：
- 函数URL：`https://your-site.netlify.app/.netlify/functions/proxy`

---

## 方案三：WSL2 + Docker 部署

### 🐳 为什么选择Docker？
- 环境隔离，避免系统污染
- 便于迁移和复制
- 管理简单，一键启停

### 📝 详细步骤

#### 第1步：安装WSL2

1. **以管理员身份运行PowerShell**
   ```powershell
   # 启用WSL
   wsl --install
   
   # 重启电脑
   ```

2. **安装Ubuntu（推荐）**
   ```powershell
   # 在Microsoft Store安装Ubuntu后
   # 初始化Ubuntu用户
   ubuntu
   ```

#### 第2步：安装Docker

1. **在WSL2中安装Docker**
   ```bash
   # 更新包列表
   sudo apt update
   
   # 安装依赖
   sudo apt install apt-transport-https ca-certificates curl software-properties-common
   
   # 添加Docker官方GPG密钥
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   
   # 添加Docker仓库
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   
   # 安装Docker
   sudo apt update
   sudo apt install docker-ce docker-ce-cli containerd.io
   
   # 启动Docker服务
   sudo systemctl start docker
   sudo systemctl enable docker
   
   # 验证安装
   sudo docker run hello-world
   ```

#### 第3步：创建项目文件夹

```bash
mkdir openai-docker-proxy
cd openai-docker-proxy
```

#### 第4步：创建项目文件

**创建 ` Dockerfile `**
```dockerfile
FROM nginx:alpine

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**创建 ` nginx.conf `**
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    include /etc/nginx/conf.d/*.conf;
}
```

**创建 ` default.conf `**
```nginx
server {
    listen 80;
    server_name localhost;
    
    # 日志
    access_log /var/log/nginx/openai-access.log;
    error_log /var/log/nginx/openai-error.log;
    
    # 代理配置
    location /proxy/ {
        # 鉴权配置
        auth_basic "OpenAI API Proxy";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        # 重写URL，去掉/proxy前缀
        rewrite ^/proxy/(.*)$ /$1 break;
        
        # 反向代理到OpenAI
        proxy_pass https://api.openai.com;
        proxy_set_header Host api.openai.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # CORS配置
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
            add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }
}
```

**创建 ` docker-compose.yml `**
```yaml
version: '3.8'

services:
  nginx-proxy:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
    volumes:
      - ./data:/var/log/nginx
    environment:
      - NGINX_PORT=80
```

#### 第5步：设置访问密码

```bash
# 安装apache2-utils（包含htpassTpd）
sudo apt install apache2-utils

# 创建密码文件（会提示输入密码）
sudo htpasswd -c .htpasswd yourusername

# 会创建.htpasswd文件，移动到Docker使用
```

#### 第6步：创建启动脚本

创建 ` start.sh `：
```bash
#!/bin/bash

# 设置权限
chmod +x .htpasswd

# 启动Docker容器
docker-compose up -d

echo "代理服务已启动！"
echo "访问地址：http://localhost:8080/proxy/v1/chat/completions"
echo "用户名：yourusername"
```

```bash
# 赋予执行权限
chmod +x start.sh
```

#### 第7步：启动服务

```bash
# 启动服务
./start.sh

# 查看日志
docker logs -f openai-docker-proxy_nginx-proxy_1

# 停止服务
docker-compose down
```

#### 第8步：配置防火墙（如果需要暴露到外网）

```bash
# 允许8080端口
sudo ufw allow 8080

# 启用防火墙（如果未启用）
sudo ufw enable
```

#### 第9步：测试代理

```bash
curl -X POST http://localhost:8080/proxy/v1/chat/completions \
  -u yourusername:yourpassword \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

---

## 常见问题解答

### Q1: Vercel/Netlify 方案有请求限制吗？

**A:** 是的，有限制：
- Vercel：每个请求最大10秒，每月100GB流量
- Netlify：每个请求最大10秒，每月125GB流量
- 如果API响应慢或请求超时，可能会失败

### Q2: API密钥安全吗？

**A:** 非常安全：
- 所有方案都使用环境变量存储密钥
- 代码中不会暴露真实密钥
- Vercel/Netlify会自动加密环境变量

### Q3: 免费额度够用吗？

**A:** 对个人使用来说通常够用：
- OpenAI每月有$5-$18免费额度（新用户）
- Vercel/Netlify提供足够的请求次数
- 个人开发或小项目完全免费

### Q4: 访问速度如何？

**A:** 取决于部署方案：
1. **Vercel/Netlify：** 有CDN加速，国内访问可能较慢
2. **自己的服务器：** 如果选择亚洲服务器，速度较快

### Q5: 可以自定义域名吗？

**A:** 可以：
- Vercel：在控制台绑定域名，自动配置HTTPS
- Netlify：同样支持自定义域名
- 自己服务器：需要手动配置SSL证书

---

## 安全注意事项

### ⚠️ 必须了解的安全风险

1. **API密钥保护**
   - 不要将密钥提交到GitHub
   - 定期更换API密钥
   - 监控API使用情况

2. **访问控制**
   - 避免将代理地址公开分享
   - 考虑添加白名单IP限制
   - 定期检查访问日志

3. **费用监控**
   - OpenAI按使用量收费
   - 设置使用额度警报
   - 避免被恶意使用产生高额费用

4. **合规性**
   - 遵守OpenAI使用条款
   - 不要用于违法内容
   - 注意数据隐私

### 🔧 建议的安全措施

1. **添加访问限流**
   ```nginx
   # Nginx配置示例
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
   
   location /proxy/ {
       limit_req zone=api burst=20 nodelay;
       # ...其他配置
   }
   ```

2. **记录详细日志**
   - 保存所有请求日志
   - 定期分析异常访问
   - 设置日志告警

3. **备份和恢复**
   - 保存配置文件
   - 记录重要操作步骤
   - 准备应急方案

---

## 💡 最终建议

### 如果你：
- **是完全新手** → 选择 **Vercel** 方案
- **只需要临时使用** → 选择 **Vercel** 
- **对性能要求高** → 选择 **自己服务器**
- **有运维经验** → 选择 **Docker** 方案

### 快速开始推荐：
1. 先用 **Vercel** 方案尝试（5分钟搞定）
2. 如果遇到限制，再考虑 **服务器方案**
3. 根据实际情况选择最适合的方案

祝你部署成功！如果有任何问题，欢迎提问。