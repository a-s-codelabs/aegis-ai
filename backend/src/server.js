import app from './app.js';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend API server running on http://${HOST}:${PORT}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🤖 AI endpoints: http://${HOST}:${PORT}/api/ai/*`);
  console.log(`📞 Call endpoints: http://${HOST}:${PORT}/api/call/*`);
});

