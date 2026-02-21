const express = require('express');
const bcrypt  = require('bcryptjs');
const db = require('../utils/db');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.use(protect);

function sanitizeUser(user) { const { password, ...safe } = user; return safe; }

router.get('/profile', async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: sanitizeUser(user) });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.put('/update', async (req, res) => {
  try {
    const { name, age } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (age) updates.age = age;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update.' });
    const updated = await db.updateUser(req.user.id, updates);
    res.json({ message: 'Profile updated! 🌸', user: sanitizeUser(updated) });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be 6+ characters.' });
    const user = await db.findUserById(req.user.id);
    if (!await bcrypt.compare(currentPassword, user.password)) return res.status(401).json({ error: 'Current password incorrect.' });
    await db.updateUser(req.user.id, { password: await bcrypt.hash(newPassword, 12) });
    res.json({ message: 'Password changed! 💗' });
  } catch (err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;