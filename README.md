# OpenAI API Proxy for Cloudflare Workers

A minimalist reverse proxy for the OpenAI API, deployed on Cloudflare Workers for global edge routing and maximum performance.

## 🎯 Features
- ✅ Forwards all requests to the OpenAI API
- ✅ Helps bypass network restrictions
- ✅ Deployed on Cloudflare's edge network for low latency
- ✅ CORS enabled for cross-origin requests
- ✅ Simple and lightweight implementation

## 🚀 Deployment Guide

### Prerequisites
- A Cloudflare account (free tier available)
- Node.js installed on your local machine
- wrangler CLI

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```
This will open a browser window where you can log in to your Cloudflare account.

### Step 3: Get Your Account ID
If you haven't already, find your Account ID in the Cloudflare dashboard:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. On the right sidebar, under "Workers & Pages", you'll see your "Account ID"
3. Copy this ID

### Step 4: Configure wrangler.toml
Update the `wrangler.toml` file with your Account ID:

```toml
name = "openai-api-proxy"
compatibility_date = "2024-09-04"
main = "cloudflare-worker.js"

# Replace with your actual Account ID
account_id = "your-account-id-here"
```

### Step 5: Deploy the Worker
```bash
wrangler deploy
```

The first time you deploy, Wrangler might ask you to create a worker. Just follow the prompts.

After deployment, you'll get your worker URL, which will look like:
`https://openai-api-proxy.your-subname.workers.dev`

## 🔧 Usage

After deployment, replace the official OpenAI API base URL with your proxy URL:

**Original:**
`https://api.openai.com/v1/chat/completions`

**New:**
`https://openai-api-proxy.your-subname.workers.dev/v1/chat/completions`

### Example Usage with curl
```bash
curl -X POST https://openai-api-proxy.your-subname.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-openai-api-key" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

## ⚙️ Configuration

The proxy is pre-configured to:

- Forward all requests to `https://api.openai.com`
- Handle CORS preflight (OPTIONS) requests
- Set appropriate CORS headers for all responses
- Include a health check endpoint at `/health`

## ⚠️ Limitations

- **No Streaming Support**: This proxy does not support streaming responses (`stream: true`) as it buffers the entire response.
- **Request Size**: Cloudflare Workers have a 128MB request/response size limit.

## 🔍 Health Check

You can check if your proxy is running correctly by visiting:
`https://openai-api-proxy.your-subname.workers.dev/health`

This should return a JSON response:
```json
{
  "status": "ok",
  "message": "OpenAI API Proxy is running",
  "version": "1.0.0"
}
```

## 📄 License
MIT