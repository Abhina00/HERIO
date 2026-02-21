# 🌸 HER Backend – Setup Guide

## Complete File Structure

```
HER/
├── index.html
├── login.html
├── signup.html
├── mode.html
├── chat.html
├── pcod-checker.html
├── breast-checker.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── config.js       ← Frontend config (API URL)
│   ├── api.js          ← NEW: Backend API helper
│   ├── auth.js         ← Login/Signup (calls backend)
│   ├── chat.js         ← Chat (calls backend)
│   ├── main.js         ← Landing page
│   └── notifications.js
│
└── backend/
    ├── server.js           ← Express server entry point
    ├── package.json        ← Dependencies list
    ├── .env.example        ← Copy this to .env
    ├── data/
    │   └── database.json   ← Auto-created on first run
    ├── routes/
    │   ├── auth.js         ← /api/auth/*
    │   ├── chat.js         ← /api/chat/*
    │   └── user.js         ← /api/user/*
    ├── middleware/
    │   └── auth.js         ← JWT verification
    └── utils/
        └── db.js           ← JSON file database
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js
Download from https://nodejs.org (version 18+ recommended)

### Step 2 — Install backend dependencies
```bash
cd HER/backend
npm install
```
This installs: express, bcryptjs, jsonwebtoken, dotenv, cors, helmet, express-rate-limit, openai, better-sqlite3, morgan, uuid, node-fetch

### Step 3 — Configure environment variables
```bash
cp .env.example .env
```
Then open `.env` and edit:
```
JWT_SECRET=make_this_a_long_random_string_nobody_can_guess
OPENAI_API_KEY=sk-your-actual-key-from-platform.openai.com
```

### Step 4 — Start the backend
```bash
npm start
# or for auto-reload during development:
npm run dev
```
You should see:
```
🌸 HER Backend running on http://localhost:5000
📋 Environment: development
🔑 OpenAI Key: ✅ Configured
```

### Step 5 — Open the frontend
Just open `HER/index.html` in your browser.
The frontend is already configured to talk to `http://localhost:5000/api`

---

## 🔌 API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login, get JWT token |
| GET | /api/auth/me | Yes | Get current user |
| POST | /api/chat/message | Yes | Send message, get AI reply |
| GET | /api/chat/history | Yes | Load chat history |
| DELETE | /api/chat/clear | Yes | Clear chat history |
| GET | /api/user/profile | Yes | Get profile |
| PUT | /api/user/update | Yes | Update name/age |
| PUT | /api/user/change-password | Yes | Change password |

---

## 🔐 How Security Works

```
SIGNUP:
User password "hello123"
→ bcrypt.hash("hello123", 12)
→ "$2a$12$xK8..." (stored in database — unreadable)
→ JWT token created and returned to browser

LOGIN:
User enters "hello123"
→ bcrypt.compare("hello123", "$2a$12$xK8...")
→ ✅ Match! JWT token returned
→ Token stored in browser localStorage

EVERY PROTECTED REQUEST:
Browser sends: Authorization: Bearer eyJhbG...
→ Backend verifies token signature with JWT_SECRET
→ Extracts userId from token
→ Allows request to proceed
```

---

## 🗄️ Where Data Lives

`backend/data/database.json` — auto-created on first run:
```json
{
  "users": [
    {
      "id": "uuid-here",
      "name": "Priya",
      "email": "priya@example.com",
      "password": "$2a$12$hashed...",
      "age": 25,
      "createdAt": "2024-01-01T..."
    }
  ],
  "chats": {
    "uuid-here_normal": [
      { "role": "user", "content": "...", "timestamp": "..." },
      { "role": "assistant", "content": "...", "timestamp": "..." }
    ]
  }
}
```

For production → replace db.js with MongoDB or PostgreSQL.

---

## 🌍 Deploying to Production

**Backend:** Deploy to Railway, Render, or Heroku
```bash
# Set environment variables on your platform dashboard
# They replace the .env file in production
```

**Frontend:** Deploy to Netlify or Vercel
- Update `js/config.js` API_URL to your deployed backend URL:
```js
API_URL: "https://her-api.yourdomain.com/api"
```

---

## ⚠️ Disclaimer
HER is not a medical diagnosis tool. Always consult a qualified healthcare professional.
