# OpenAI API Proxy for Cloudflare Workers

A minimalist reverse proxy for the OpenAI API, deployed on Cloudflare Workers for global edge routing and maximum performance.

## 🎯 Features
- ✅ Forwards all requests to the OpenAI API
- ✅ Helps bypass network restrictions
- ✅ Deployed on Cloudflare's edge network for low latency
- ✅ CORS enabled for cross-origin requests
- ✅ Simple and lightweight implementation

## 🚀 Quick Start

Choose a deployment method that suits your technical level:

### 🧑‍💻 Method 1: Manual Copy (Recommended for Beginners)
The simplest way - just copy 2 files and deploy.

#### Step 1: Create Project Folder
```bash
mkdir openai-proxy
cd openai-proxy
```

#### Step 2: Create `cloudflare-worker.js`
Copy the following content into `cloudflare-worker.js`:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle OPTIONS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'OpenAI API Proxy is running',
        version: '1.0.0'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Proxy to OpenAI
    try {
      const targetUrl = `https://api.openai.com${url.pathname}${url.search}`;
      
      const headers = new Headers(request.headers);
      headers.set('User-Agent', 'OpenAI-Proxy/1.0');
      
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.body
      });

      const response = await fetch(modifiedRequest);
      
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Proxy error',
        message: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
```

#### Step 3: Create `wrangler.toml`
Copy the following content into `wrangler.toml`:

```toml
name = "openai-api-proxy"
compatibility_date = "2024-09-04"
main = "cloudflare-worker.js"

# Replace with your actual Account ID from Cloudflare Dashboard
account_id = "your-account-id-here"
```

#### Step 4: Install Wrangler and Deploy
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Get your Account ID from: https://dash.cloudflare.com
# Update account_id in wrangler.toml

# Deploy
wrangler deploy
```

### 🐙 Method 2: Fork Repository (Recommended for Developers)
Best if you want to track updates and customize the code.

#### Step 1: Fork the Repository
1. Visit: https://github.com/zhu-jl18/Simple-OpenAI-API-Proxy
2. Click the "Fork" button in the top-right corner
3. Wait for it to create your fork

#### Step 2: Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/Simple-OpenAI-API-Proxy.git
cd Simple-OpenAI-API-Proxy
```

#### Step 3: Configure and Deploy
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Get your Account ID from: https://dash.cloudflare.com
# Update account_id in wrangler.toml

# Deploy
wrangler deploy
```

#### Step 4: Stay Updated (Optional)
To get future updates from the original repo:
```bash
git remote add upstream https://github.com/zhu-jl18/Simple-OpenAI-API-Proxy.git
git pull upstream main
```

### 🌐 Method 3: Web Console (No Command Line)
Perfect for non-technical users who prefer a graphical interface.

#### Step 1: Go to Cloudflare Dashboard
Visit: https://dash.cloudflare.com

#### Step 2: Create a Worker
1. Click "Workers & Pages" in the left sidebar
2. Click "Create application"
3. Select "Create Worker"
4. Name it `openai-api-proxy`
5. Click "Deploy"

#### Step 3: Edit the Worker Code
1. Click "Edit code"
2. Delete all existing code
3. Copy the entire `cloudflare-worker.js` content from Method 1 above
4. Paste it into the editor
5. Click "Save and Deploy"

#### Step 4: Configure Settings
No configuration needed! The worker will work with default settings.

However, if you want to customize the name or add variables:
1. Click "Settings" tab
2. Click "Variables"
3. Add any custom variables if needed

## 🔧 Usage

After deployment, your proxy will be available at:
`https://openai-api-proxy.YOUR_SUBDOMAIN.workers.dev`

Replace the official OpenAI API base URL:
- **Original:** `https://api.openai.com/v1/chat/completions`
- **New:** `https://openai-api-proxy.YOUR_SUBDOMAIN.workers.dev/v1/chat/completions`

### Example Usage with curl
```bash
curl -X POST https://openai-api-proxy.YOUR_SUBDOMAIN.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-openai-api-key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## 🧪 Health Check

Verify your proxy is working:
```bash
curl https://openai-api-proxy.YOUR_SUBDOMAIN.workers.dev/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "OpenAI API Proxy is running",
  "version": "1.0.0"
}
```

## 📊 Method Comparison

| Method | Best For | Difficulty | Updates | Customization |
|--------|----------|------------|---------|---------------|
| **Manual Copy** | Beginners, Quick start | ⭐ | Manual | Full control |
| **Fork Repo** | Developers, Contributing | ⭐⭐ | Auto track | Version control |
| **Web Console** | Non-technical users | ⭐ | Manual copy | Basic |

## ⚠️ Limitations

- **No Streaming Support**: This proxy does not support streaming responses (`stream: true`)
- **Request Size**: Cloudflare Workers have a 128MB request/response size limit
- **Rate Limits**: Cloudflare's free tier has daily request limits (100k requests/day)

## 🔍 Troubleshooting

### Common Issues:

1. **"account_id not found"**
   - Make sure you've replaced `your-account-id-here` in `wrangler.toml`
   - Get your Account ID from Cloudflare Dashboard

2. **"Unauthorized" error**
   - Check your OpenAI API key is correct
   - Ensure your API key has access to the model you're using

3. **CORS errors**
   - The proxy includes CORS headers. If you still see errors:
   - Make sure you're using your proxy URL, not the original OpenAI URL

## 📄 License
MIT