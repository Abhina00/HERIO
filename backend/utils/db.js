const fs = require('fs').promises;
const path = require('path');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/database.json');
const DEFAULT_DB = { users: [], chats: {} };

async function readDB() {
  try { return JSON.parse(await fs.readFile(DB_PATH, 'utf-8')); }
  catch (err) { if (err.code === 'ENOENT') return { ...DEFAULT_DB }; throw err; }
}
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
async function init() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try { await fs.access(DB_PATH); console.log('📁 Database loaded'); }
  catch { await writeDB(DEFAULT_DB); console.log('📁 New database created'); }
}
async function findUserByEmail(email) {
  return ((await readDB()).users || []).find(u => u.email === email.toLowerCase()) || null;
}
async function findUserById(id) {
  return ((await readDB()).users || []).find(u => u.id === id) || null;
}
async function saveUser(user) {
  const db = await readDB(); db.users.push(user); await writeDB(db); return user;
}
async function updateUser(id, updates) {
  const db = await readDB();
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error('User not found');
  db.users[idx] = { ...db.users[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeDB(db); return db.users[idx];
}
async function getChatHistory(userId, mode) {
  const db = await readDB(); return db.chats[`${userId}_${mode}`] || [];
}
async function saveMessage(userId, mode, message) {
  const db = await readDB(); const key = `${userId}_${mode}`;
  if (!db.chats[key]) db.chats[key] = [];
  db.chats[key].push(message);
  if (db.chats[key].length > 100) db.chats[key] = db.chats[key].slice(-100);
  await writeDB(db); return message;
}
async function clearChat(userId, mode) {
  const db = await readDB(); db.chats[`${userId}_${mode}`] = []; await writeDB(db);
}
module.exports = { init, findUserByEmail, findUserById, saveUser, updateUser, getChatHistory, saveMessage, clearChat };