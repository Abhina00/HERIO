/**
 * ============================================================
 * HER – Chat JavaScript (js/chat.js)
 *
 * Now uses the BACKEND API for:
 * - Loading chat history (stored in server's database.json)
 * - Sending messages (backend calls OpenAI, returns response)
 * - Clearing history (deletes from server database)
 *
 * The OpenAI API key NEVER touches the browser.
 * All AI calls happen server-side in routes/chat.js
 * ============================================================
 */

// ===== STATE =====
let currentUser = null;   // Logged-in user object
let currentMode = "normal"; // "normal" or "pregnancy"
let messages    = [];     // In-memory message list for this session

// ===== INITIALIZE =====
// Called once when the page loads
async function init() {
  // requireAuth() checks for a valid JWT token with the backend
  // If not logged in or token expired → redirects to login.html
  currentUser = await requireAuth();
  if (!currentUser) return; // Will have been redirected

  // Get mode from localStorage (set on mode.html)
  currentMode = localStorage.getItem("herMode") || "normal";

  // Update UI: mode tag in header
  const modeTag = document.getElementById("modeTag");
  if (modeTag) {
    modeTag.textContent = currentMode === "pregnancy"
      ? "🤰 Pregnancy Mode"
      : "🌸 Normal Mode";
  }

  // Load chat history from the server
  await loadHistory();

  // Render suggestion chips
  renderSuggestions();
}


// ===== LOAD HISTORY FROM SERVER =====
async function loadHistory() {
  try {
    const data = await ChatAPI.getHistory(currentMode);
    messages = data.history || [];
    renderMessages();
  } catch (err) {
    console.error("Failed to load history:", err.message);
    // Show welcome message even if history load fails
    renderMessages();
  }
}


// ===== RENDER ALL MESSAGES =====
function renderMessages() {
  const area = document.getElementById("messagesArea");
  if (!area) return;

  area.innerHTML = "";

  // If no messages yet, show the welcome message
  if (messages.length === 0) {
    const welcome = {
      role: "assistant",
      content: currentMode === "pregnancy"
        ? `🤰💗 Hello, mama-to-be! I'm HER, your pregnancy companion. I'm so happy you're here. How many weeks along are you? Tell me everything — how you're feeling, what worries you, what excites you. You're not alone in this beautiful journey. 🌸`
        : `🌸💗 Hello ${currentUser?.name || "beautiful"}! I'm HER — your caring AI companion for women's health.\n\nI can help you with PCOD, period concerns, breast health awareness, emotional support, and so much more. What's on your heart today, love?`,
      timestamp: new Date().toISOString(),
    };
    renderSingleMessage(welcome);
    return;
  }

  messages.forEach(msg => renderSingleMessage(msg));
  scrollToBottom();
}


// ===== RENDER ONE MESSAGE BUBBLE =====
function renderSingleMessage(msg) {
  const area   = document.getElementById("messagesArea");
  const isUser = msg.role === "user";

  // Format timestamp
  const time = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const el = document.createElement("div");
  el.className = `message ${isUser ? "user" : "bot"}`;

  // Preserve line breaks from AI responses
  const formattedContent = (msg.content || "").replace(/\n/g, "<br/>");

  el.innerHTML = `
    <div class="msg-avatar">${isUser ? "👤" : "🌸"}</div>
    <div class="msg-content">
      <div class="msg-bubble">${formattedContent}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;

  area.appendChild(el);
}


// ===== SCROLL TO BOTTOM =====
function scrollToBottom() {
  const area = document.getElementById("messagesArea");
  if (area) area.scrollTop = area.scrollHeight;
}


// ===== SHOW / HIDE TYPING INDICATOR =====
function showTyping() {
  const area = document.getElementById("messagesArea");
  const el = document.createElement("div");
  el.className = "message bot";
  el.id = "typingIndicator";
  el.innerHTML = `
    <div class="msg-avatar">🌸</div>
    <div class="msg-content">
      <div class="msg-bubble" style="padding:14px 18px;">
        <div class="typing-indicator" style="margin:0;">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  area.appendChild(el);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}


// ===== SEND MESSAGE =====
async function sendMessage() {
  const input = document.getElementById("chatInput");
  const text  = input.value.trim();
  if (!text) return;

  // Clear input, reset height
  input.value = "";
  input.style.height = "auto";

  // Hide suggestion bar after first message
  const sugBar = document.getElementById("suggestionsBar");
  if (sugBar) sugBar.style.display = "none";

  // Optimistically render the user message immediately
  const userMsg = {
    role:      "user",
    content:   text,
    timestamp: new Date().toISOString(),
  };
  messages.push(userMsg);
  renderSingleMessage(userMsg);
  scrollToBottom();

  // Show typing animation
  showTyping();

  try {
    // ===== Send to BACKEND =====
    // The backend handles the OpenAI call and saves messages to database
    const data = await ChatAPI.sendMessage({
      message: text,
      mode:    currentMode,
      history: messages.slice(-10), // Send recent history for context
    });

    hideTyping();

    // Add bot response to local messages array
    const botMsg = {
      role:      "assistant",
      content:   data.message,
      timestamp: data.timestamp || new Date().toISOString(),
    };
    messages.push(botMsg);
    renderSingleMessage(botMsg);
    scrollToBottom();

  } catch (err) {
    hideTyping();
    console.error("Chat error:", err.message);

    // Show a gentle error message
    const errMsg = {
      role:      "assistant",
      content:   "I'm so sorry love — I had a little trouble connecting. Please try again in a moment. 💗",
      timestamp: new Date().toISOString(),
    };
    messages.push(errMsg);
    renderSingleMessage(errMsg);
    scrollToBottom();
  }
}


// ===== SEND A PRE-WRITTEN QUICK MESSAGE =====
function sendQuickMessage(text) {
  document.getElementById("chatInput").value = text;
  sendMessage();
}


// ===== HANDLE ENTER KEY =====
// Enter = send, Shift+Enter = new line
function handleKeyDown(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}


// ===== AUTO-RESIZE TEXTAREA =====
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}


// ===== CLEAR CHAT =====
async function clearChat() {
  if (!confirm("Clear your chat history with HER? 💗")) return;

  try {
    // Delete from server database
    await ChatAPI.clearHistory(currentMode);
    messages = [];
    renderMessages();
  } catch (err) {
    alert("Couldn't clear chat: " + err.message);
  }
}


// ===== LOGOUT =====
function logout() {
  AuthAPI.logout(); // Clears token + redirects to index.html
}


// ===== RENDER SUGGESTION CHIPS =====
function renderSuggestions() {
  const bar = document.getElementById("suggestionsBar");
  if (!bar) return;

  const normal = [
    "I have irregular periods",
    "Tell me about PCOD",
    "I need emotional support",
    "Give me a self-love affirmation",
    "Tips for women's health",
  ];

  const pregnancy = [
    "I'm in my first trimester",
    "What should I eat during pregnancy?",
    "I have morning sickness",
    "Tell me about baby development",
    "I feel anxious about pregnancy",
  ];

  const chips = currentMode === "pregnancy" ? pregnancy : normal;

  bar.innerHTML = `
    <div style="
      display: flex; gap: 10px; flex-wrap: wrap;
      padding: 12px 24px; background: white;
      border-top: 1px solid var(--border);
    ">
      <span style="font-size:0.82rem; color:var(--text-light); width:100%; margin-bottom:4px;">💗 Quick questions:</span>
      ${chips.map(s => `
        <button onclick="sendQuickMessage('${s}')" style="
          padding: 8px 16px; border: 1px solid var(--border);
          border-radius: 50px; background: var(--cream);
          color: var(--text-dark); font-size: 0.85rem;
          cursor: pointer; font-family: 'Lato', sans-serif;
          transition: all 0.2s;
        "
        onmouseover="this.style.borderColor='var(--pink-medium)'; this.style.background='var(--lavender)';"
        onmouseout="this.style.borderColor='var(--border)'; this.style.background='var(--cream)';">
          ${s}
        </button>
      `).join("")}
    </div>
  `;
}


// ===== START =====
init();
