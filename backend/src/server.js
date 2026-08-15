const { connectDatabase, disconnectDatabase } = require('./config/db');
const { env, validateEnvironment } = require('./config/env');
const { app } = require('./app');

let server;

async function startServer() {
  validateEnvironment();
  await connectDatabase();

  server = app.listen(env.port, () => {
    console.info(`API listening on port ${env.port} (${env.nodeEnv})`);
  });
}

async function shutdown(signal) {
  console.info(`${signal} received; shutting down gracefully.`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer().catch((error) => {
  console.error('Failed to start the API:', error.message);
  process.exit(1);
});
