/**
 * ============================================================
 * HER – Main Server (server.js)
 * 
 * Entry point for the HER backend.
 * Powered by Grok (xAI) for AI responses.
 * 
 * Run:      node server.js
 * Dev mode: nodemon server.js
 * ============================================================
 */

require('dotenv').config(); // Load .env variables first

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

// Route files
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/user');

// JSON database helper
const db = require('./utils/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================

// helmet() — sets secure HTTP headers (XSS protection, etc.)
app.use(helmet());

// morgan('dev') — logs each request: POST /api/chat/message 200 45ms
app.use(morgan('dev'));

// cors() — allows the frontend (different port/domain) to call the backend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// express.json() — parses JSON request bodies so we can use req.body
app.use(express.json());

// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth', authRoutes); // /api/auth/signup, /api/auth/login, /api/auth/me
app.use('/api/chat', chatRoutes); // /api/chat/message, /api/chat/history, /api/chat/clear
app.use('/api/user', userRoutes); // /api/user/profile, /api/user/update

// Health check route
app.get('/', (req, res) => {
  res.json({
    status:    'ok',
    message:   '🌸 HER API is running',
    ai:        'Grok (xAI)',
    model:     process.env.GROK_MODEL || 'grok-3-mini',
    version:   '2.0.0',
  });
});

// 404 handler — no route matched
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — catches thrown errors in routes
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ============================================================
// START
// ============================================================

db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌸 HER Backend running on http://localhost:${PORT}`);
    console.log(`📋 Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 AI Provider : Grok (xAI)`);
    console.log(`🧠 Model       : ${process.env.GROK_MODEL || 'grok-3-mini'}`);
    console.log(`🔑 Grok Key    : ${process.env.GROK_API_KEY && process.env.GROK_API_KEY !== 'your_grok_api_key_here' ? '✅ Configured' : '❌ Not set (using fallback responses)'}\n`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});