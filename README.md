# Simple OpenAI API Proxy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/your-repo-name)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo-name)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/your-repo-name)
<a href="https://github.com/your-username/your-repo-name#cloudflare-workers"><img src="https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-orange" alt="Deploy to Cloudflare Workers"></a>

A minimalist reverse proxy for the OpenAI API. Its sole purpose is to forward requests, helping to resolve network access issues.

## 🎯 Features
- ✅ Forwards all requests to the OpenAI API.
- ✅ Helps bypass network restrictions.
- ✅ One-click deployment to multiple platforms (Render, Vercel, Netlify).
- ✅ Supports manual deployment to Cloudflare Workers.
- ✅ Simple, focused, and easy to use.

## 🚀 Deployment

This project can be deployed to various platforms. Choose the one that best fits your needs.

### One-Click Deployment (Recommended for Node.js Version)

You can deploy the Node.js version (`index.js`) with a single click to the following platforms:

| Platform | Button | Notes |
|----------|--------|-------|
| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/your-repo-name) | Runs as a persistent Node.js web service. Reliable and easy to manage. |
| **Vercel** | [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/your-repo-name) | Deploys as a serverless function. Generous free tier. |
| **Netlify**| [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/your-repo-name) | Deploys as a serverless function. Also has a great free tier. |

**Note:** Remember to replace `your-username/your-repo-name` in the URLs above with your actual GitHub repository details after you fork/clone it.

### Cloudflare Workers (Manual Deployment)

For the lowest possible latency, you can deploy the edge version (`cloudflare-worker.js`).

1.  **Install Wrangler CLI:**
    ```bash
    npm install -g wrangler
    ```
2.  **Login to Cloudflare:**
    ```bash
    wrangler login
    ```
3.  **Deploy the Worker:**
    ```bash
    npm run deploy:cloudflare
    ```

## 平台选择指南 (Platform Comparison)

Not sure which platform to choose? Here's a quick comparison:

| Feature               | Cloudflare Workers (Edge) | Vercel / Netlify (Serverless) | Render (Web Service) |
|-----------------------|---------------------------|-------------------------------|----------------------|
| **Performance**       | 🏆 **Best (Lowest Latency)** | Good (Fast, but with cold starts) | Good (Always on, no cold starts) |
| **Cost (Free Tier)**  | Good (100k requests/day)  | 🏆 **Excellent (Generous)**   | Good (Free instance sleeps) |
| **Deployment Model**  | Edge Functions            | Serverless Functions          | Persistent Node.js Server |
| **Ease of Use**       | Manual CLI deployment     | 🏆 **Easiest (One-click)**    | Very Easy (One-click) |
| **Best For**          | Speed-critical applications | Hobby projects, high traffic | Traditional apps, reliability |

**Summary:**
*   **For maximum speed:** Choose **Cloudflare Workers**.
*   **For the best free tier and ease of use:** Choose **Vercel** or **Netlify**.
*   **For a simple, traditional Node.js server:** Choose **Render**.

## 🔧 Usage

After deployment, simply replace the official OpenAI API base URL with your proxy URL:

**Original:**
`https://api.openai.com/v1/chat/completions`

**New:**
`https://your-proxy-address.com/v1/chat/completions`

That's it. Your requests will now be routed through your own proxy.

## ⚠️ Limitations

*   **No Streaming Support**: This proxy buffers the entire response from OpenAI before sending it to you. Therefore, it does **not** support streaming responses (`stream: true`). This is a conscious trade-off to keep the proxy simple.

## 🛠️ Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start the server:**
    ```bash
    npm run dev
    ```
3.  The proxy will be running at `http://localhost:10000`.

## 📄 License
MIT
