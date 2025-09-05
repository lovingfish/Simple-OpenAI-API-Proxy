const { handleRequest, handleOptions } = require('./src/handler');

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    return handleRequest(request);
  }
};