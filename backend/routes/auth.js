/**
 * ============================================================
 * HER – Auth Routes (routes/auth.js)
 * 
 * Handles:
 *   POST /api/auth/signup  → Register a new user
 *   POST /api/auth/login   → Login and get JWT token
 *   GET  /api/auth/me      → Get current logged-in user info
 * ============================================================
 */

const express     = require('express');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const rateLimit   = require('express-rate-limit');

const db          = require('../utils/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ===== RATE LIMITING =====
// Prevents brute-force attacks on login endpoint
// Allows max 10 attempts per IP per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
});

// ===== HELPER: Generate JWT Token =====
function generateToken(user) {
  return jwt.sign(
    // Payload: data stored inside the token
    { id: user.id, email: user.email, name: user.name },
    // Secret key
    process.env.JWT_SECRET,
    // Options
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ===== HELPER: Sanitize user object =====
// Never return the password to the frontend
function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}


// ============================================================
// POST /api/auth/signup
// Register a new user
// Body: { name, email, password, age? }
// ============================================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    // ===== Validate inputs =====
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // ===== Check if email already exists =====
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already registered. Please login.' });
    }

    // ===== Hash the password =====
    // bcrypt.hash(password, saltRounds)
    // Salt rounds = 12 means it's very hard to crack even if database is stolen
    const hashedPassword = await bcrypt.hash(password, 12);

    // ===== Create new user object =====
    const newUser = {
      id:        uuidv4(),                    // Unique ID
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashedPassword,              // Store HASHED password only
      age:       age || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // ===== Save to database =====
    await db.saveUser(newUser);

    // ===== Generate JWT token =====
    const token = generateToken(newUser);

    // ===== Return success =====
    res.status(201).json({
      message: `Welcome to HER, ${newUser.name}! 💗`,
      token,                        // Frontend stores this for future requests
      user: sanitizeUser(newUser)   // User info without password
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});


// ============================================================
// POST /api/auth/login
// Login with email and password
// Body: { email, password }
// ============================================================
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===== Validate inputs =====
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // ===== Find user by email =====
    const user = await db.findUserByEmail(email);
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    // ===== Compare password with stored hash =====
    // bcrypt.compare() hashes the input and compares — never decrypts
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    // ===== Generate JWT token =====
    const token = generateToken(user);

    // ===== Return success =====
    res.json({
      message: `Welcome back, ${user.name}! 💗`,
      token,
      user: sanitizeUser(user)
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});


// ============================================================
// GET /api/auth/me
// Get current logged-in user's info
// Requires: Authorization: Bearer <token>
// ============================================================
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await db.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: sanitizeUser(user) });

  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to get user info.' });
  }
});


module.exports = router;
