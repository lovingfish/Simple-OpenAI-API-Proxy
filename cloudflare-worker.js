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