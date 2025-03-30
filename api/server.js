import express from 'express';
import { createServer } from 'http';

// Create Express app
const app = express();
app.use(express.json());

// Import routes from server/index.ts
import { registerRoutes } from '../server/routes.js';
import { setupVite, serveStatic } from '../server/vite.js';

// Initialize the routes
const server = createServer(app);
registerRoutes(app);

// In production, serve static files
if (process.env.NODE_ENV === 'production') {
  serveStatic(app);
}

export default function (req, res) {
  return new Promise((resolve, reject) => {
    server.emit('request', req, res);
  });
}