const app = require('./index.js');

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 OpenAI API Proxy running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
