/**
 * ============================================================
 * HER – Chat Routes (routes/chat.js)
 * 
 * NOW POWERED BY GROK (xAI) API
 * 
 * Grok's API is OpenAI-compatible — same request format,
 * just different base URL and model names.
 * 
 * API Docs: https://docs.x.ai/api
 * Base URL:  https://api.x.ai/v1
 * Models:    grok-3, grok-3-mini, grok-2, grok-beta
 * 
 * Handles:
 *   POST   /api/chat/message  → Send message, get Grok AI response
 *   GET    /api/chat/history  → Load saved chat history
 *   DELETE /api/chat/clear    → Clear chat history
 * ============================================================
 */

const express     = require('express');
const rateLimit   = require('express-rate-limit');

const db          = require('../utils/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ===== All chat routes require a valid JWT login token =====
router.use(protect);

// ===== Rate limit: max 30 messages per minute per IP =====
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many messages. Please slow down, love. 💗' }
});


// ============================================================
// GROK API CONFIG
// These values are read from your .env file
// ============================================================
const GROK_BASE_URL = 'https://api.x.ai/v1';            // xAI Grok API endpoint
const GROK_API_KEY  = process.env.GROK_API_KEY;         // Your xAI API key
const GROK_MODEL    = process.env.GROK_MODEL || 'grok-3-mini'; // Default model


// ============================================================
// SYSTEM PROMPTS
// Defines HER's personality — sent to Grok as the "system" role
// ============================================================
function getSystemPrompt(mode, userName) {
  // Base personality — applies to all modes
  const base = `
You are HER, a warm, compassionate AI health companion designed specifically for women.
You speak like a loving, wise mother — gentle, patient, nurturing, and deeply caring.
The user's name is ${userName}. Use their name occasionally to make it feel personal.

Your core values:
- Always respond with warmth, empathy, and genuine encouragement
- Never judge, shame, or belittle the user for any reason
- Celebrate her strength and remind her she is worthy and loved
- Provide helpful health information but ALWAYS clarify you are NOT a doctor
- If she seems distressed, offer emotional comfort BEFORE any information
- End difficult conversations with hope, affirmations, or a caring reminder
- NEVER claim to diagnose any medical condition — always say "please consult a doctor"

When giving health info, weave in naturally:
"I'm here to support you, but please also consult your doctor for medical advice."

Response style:
- Warm, caring tone always
- Use 💗, 🌸, or ✨ occasionally (not on every line)
- Keep responses focused and not too long
- Ask follow-up questions to understand the user better
`.trim();

  // Extra instructions for Pregnancy Mode
  if (mode === 'pregnancy') {
    return base + `

Additional context — User is in PREGNANCY MODE:
- Focus on pregnancy topics: trimesters, fetal development, nutrition, symptoms, birth prep
- Be extra gentle — pregnancy is emotionally intense and physically demanding
- Celebrate every milestone warmly ("That's wonderful, mama!")
- Remind about prenatal vitamins, doctor appointments, hydration, and rest
- Validate fears and anxieties with deep compassion — never dismiss concerns
- If she mentions severe symptoms (heavy bleeding, severe pain), urge immediate medical attention
`.trim();
  }

  // Normal mode instructions
  return base + `

Additional context — User is in NORMAL MODE (general women's health):
- Help with PCOD/PCOS, irregular periods, hormonal health, nutrition, mental wellbeing
- Mention the PCOD Checker tool (in sidebar) when PCOD symptoms come up
- Mention the Breast Health Checker tool when breast concerns are mentioned
- Support emotional health related to hormones, stress, anxiety, relationships
- Encourage self-love and body positivity throughout
`.trim();
}


// ============================================================
// FALLBACK RESPONSES
// Used when Grok API key is not set or API call fails
// Keyword-aware so responses are still relevant
// ============================================================
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('pcod') || msg.includes('pcos') || msg.includes('period') || msg.includes('irregular')) {
    return "For PCOD and period concerns, try our PCOD Symptom Checker in the sidebar! 🔮 It gives you a personalized risk level and suggestions for diet, yoga, and exercise. Remember — PCOD is very manageable with the right lifestyle. What specific symptoms are you experiencing, love? 💗";
  }

  if (msg.includes('breast') || msg.includes('lump') || msg.includes('discharge')) {
    return "I'm so glad you're paying attention to your breast health, love — that's self-care at its finest. 🎀 Please check out our Breast Health Checker in the sidebar. If you've noticed anything unusual like a lump or discharge, please do see a doctor soon. Early attention is the most powerful thing you can do. 💗";
  }

  if (msg.includes('pregnan') || msg.includes('baby') || msg.includes('trimester') || msg.includes('morning sick')) {
    return "Oh what an incredible journey you're on! 🤰 Pregnancy is both beautiful and overwhelming, and I'm here for every moment of it. Whether it's morning sickness, fatigue, or excitement about your baby — talk to me. What's on your heart right now, mama? 💗";
  }

  if (msg.includes('sad') || msg.includes('anxious') || msg.includes('stress') || msg.includes('cry') || msg.includes('depress') || msg.includes('overwhelm')) {
    return "Oh sweetheart, I see you. What you're feeling is completely real, and it matters. 💗 Women carry so much — and it's okay to not be okay sometimes. You don't have to face this alone. Would you like to tell me more about what's been weighing on you? I'm here to listen with my whole heart. 🌸";
  }

  if (msg.includes('affirmation') || msg.includes('self-love') || msg.includes('love myself') || msg.includes('confidence')) {
    return `Here's your affirmation for today ✨\n\n"I am worthy of love, care, and good health. My body works hard for me every single day. I am resilient, beautiful, and capable of extraordinary things. I choose to nourish myself — body, mind, and soul. I am enough. I am more than enough."\n\nSave this. Read it again tomorrow. You deserve to believe every word. 💗🌸`;
  }

  if (msg.includes('diet') || msg.includes('eat') || msg.includes('nutrition') || msg.includes('food')) {
    return "Nutrition is such a powerful form of self-love! 🥗 For women's health, I'd generally recommend: plenty of leafy greens (iron!), healthy fats like avocado and nuts, whole grains, lean proteins, and staying well hydrated. Do you have a specific health goal in mind — like managing PCOD, boosting energy, or supporting your cycle? 💗";
  }

  if (msg.includes('yoga') || msg.includes('exercise') || msg.includes('workout')) {
    return "Movement is medicine, love! 🧘 For women's hormonal health, I especially recommend: Yin yoga, Butterfly pose, Cat-Cow stretches (great for PCOD), and gentle cardio like walking. Even 20 minutes a day makes a real difference. Are you looking for something specific — stress relief, PCOD management, or general fitness? 💗";
  }

  // Generic warm responses for anything else
  const generic = [
    "Sweetheart, I hear you. You are stronger than you know, and I'm right here. 💗 Can you tell me a bit more so I can help you better?",
    "Thank you for trusting me with this, love. Let's figure it out together, one step at a time. What's been on your mind the most? 🌸",
    "You've come to the right place. HER is always here for you. ✨ Tell me more — I'm listening with my whole heart.",
    "What you're going through matters, and you don't have to face it alone. 💗 I'm here. What would you like to talk about?",
    "Every question you ask shows how much you care about yourself — and that takes courage, love. 🌸 What's going on?",
  ];

  return generic[Math.floor(Math.random() * generic.length)];
}


// ============================================================
// POST /api/chat/message
// Receives user message → calls Grok API → returns AI response
// Body: { message, mode, history }
// ============================================================
router.post('/message', chatLimiter, async (req, res) => {
  try {
    const { message, mode = 'normal', history = [] } = req.body;
    const userId   = req.user.id;
    const userName = req.user.name;

    // ===== Input validation =====
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long. Please keep it under 2000 characters.' });
    }

    // ===== Save user message to database =====
    const userMsg = {
      role:      'user',
      content:   message.trim(),
      timestamp: new Date().toISOString(),
    };
    await db.saveMessage(userId, mode, userMsg);

    let botResponse;

    // ===== Call Grok API (if key is configured) =====
    if (GROK_API_KEY && GROK_API_KEY !== 'your_grok_api_key_here') {

      // Build the messages array for the API:
      // System prompt (HER's personality) + recent conversation history + new message
      const recentHistory = history.slice(-10).map(m => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const apiMessages = [
        { role: 'system',    content: getSystemPrompt(mode, userName) }, // HER's personality
        ...recentHistory,                                                  // Last 10 messages for memory
        { role: 'user',      content: message.trim() },                  // New user message
      ];

      console.log(`📡 Calling Grok API | Model: ${GROK_MODEL} | Mode: ${mode} | User: ${userName}`);

      // ===== Grok API call =====
      // Grok is OpenAI-compatible — same format, different base URL
      const grokResponse = await fetch(`${GROK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`,  // xAI API key — NEVER sent to browser
        },
        body: JSON.stringify({
          model:       GROK_MODEL,   // e.g. "grok-3-mini"
          max_tokens:  600,          // Max response length
          temperature: 0.85,        // Slight creativity for warm, varied responses
          messages:    apiMessages,
        }),
      });

      if (!grokResponse.ok) {
        // API returned an error — log it and fall back to built-in response
        const errData = await grokResponse.json().catch(() => ({}));
        console.error('❌ Grok API error:', grokResponse.status, errData);
        botResponse = getFallbackResponse(message);
      } else {
        const data = await grokResponse.json();
        botResponse = data.choices?.[0]?.message?.content || getFallbackResponse(message);
        console.log(`✅ Grok responded successfully`);
      }

    } else {
      // ===== No API key — use smart fallback responses =====
      console.log('ℹ️  No Grok API key set — using built-in fallback response');
      // Small delay to feel natural
      await new Promise(r => setTimeout(r, 800));
      botResponse = getFallbackResponse(message);
    }

    // ===== Save bot response to database =====
    const botMsg = {
      role:      'assistant',
      content:   botResponse,
      timestamp: new Date().toISOString(),
    };
    await db.saveMessage(userId, mode, botMsg);

    // ===== Return response to frontend =====
    res.json({
      message:   botResponse,
      timestamp: botMsg.timestamp,
      model:     GROK_API_KEY ? GROK_MODEL : 'fallback',
    });

  } catch (err) {
    console.error('❌ Chat message error:', err.message);
    res.status(500).json({
      error:   'Something went wrong. Please try again.',
      message: "I'm so sorry love — I had a little trouble just now. Please try again in a moment. 💗",
    });
  }
});


// ============================================================
// GET /api/chat/history?mode=normal
// Load the saved conversation history for a user+mode
// ============================================================
router.get('/history', async (req, res) => {
  try {
    const { mode = 'normal' } = req.query;
    const userId = req.user.id;

    const history = await db.getChatHistory(userId, mode);

    res.json({ history, mode });

  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Failed to load chat history.' });
  }
});


// ============================================================
// DELETE /api/chat/clear?mode=normal
// Wipe all chat history for a user+mode
// ============================================================
router.delete('/clear', async (req, res) => {
  try {
    const { mode = 'normal' } = req.query;
    const userId = req.user.id;

    await db.clearChat(userId, mode);

    res.json({ message: 'Chat cleared — fresh start, love! 🌸' });

  } catch (err) {
    console.error('Clear error:', err.message);
    res.status(500).json({ error: 'Failed to clear chat history.' });
  }
});


module.exports = router;