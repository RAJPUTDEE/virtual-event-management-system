const express = require('express');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(authRoutes);
  app.use('/events', eventRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'route not found' });
  });

  app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || 'internal server error' });
  });

  return app;
}

module.exports = {
  createApp
};