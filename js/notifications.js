/**
 * ============================================================
 * HER – Notifications System
 * js/notifications.js
 * 
 * Handles:
 * - Period reminders
 * - Ovulation reminders
 * - Water intake reminders
 * - Exercise reminders
 * - Pregnancy weekly updates (Pregnancy Mode)
 * ============================================================
 */

// ===== GET CURRENT MODE =====
const mode = localStorage.getItem('herMode') || 'normal';

// ===== NOTIFICATION DATA =====
// These are the gentle reminder messages HER sends
const normalNotifications = [
  {
    icon: '🌙',
    title: 'Period Reminder',
    message: 'Your estimated period may be starting soon, love. Stock up on your comfort essentials! 💗',
    time: 'Just now'
  },
  {
    icon: '🌸',
    title: 'Ovulation Window',
    message: 'You may be in your ovulation window this week. Track how your body feels! 🌸',
    time: '1 hour ago'
  },
  {
    icon: '💧',
    title: 'Water Intake Reminder',
    message: 'Darling, have you had enough water today? Your body needs at least 8 glasses. Stay hydrated! 💧',
    time: '2 hours ago'
  },
  {
    icon: '🏃',
    title: 'Move Your Body',
    message: 'A gentle 20-minute walk or some yoga can do wonders for your hormones and mood today. You\'ve got this! 💪',
    time: '3 hours ago'
  },
  {
    icon: '🧘',
    title: 'Daily Self-Care Nudge',
    message: 'Remember to take your vitamins! Vitamin D, Omega-3, and Iron are especially important for women. 🌟',
    time: 'Today'
  },
  {
    icon: '💗',
    title: 'Self-Love Reminder',
    message: 'You are doing amazingly. Be gentle with yourself today. You deserve all the love you give to others. 💗',
    time: 'Today'
  }
];

const pregnancyNotifications = [
  {
    icon: '🤰',
    title: 'Prenatal Appointment Reminder',
    message: 'Don\'t forget your next prenatal check-up, mama! Your OB-GYN visits are so important. 💗',
    time: 'Just now'
  },
  {
    icon: '💊',
    title: 'Prenatal Vitamins',
    message: 'Have you taken your prenatal vitamins today? Folic acid, iron, and calcium are essential for baby\'s growth! 🌸',
    time: '1 hour ago'
  },
  {
    icon: '💧',
    title: 'Hydration Check',
    message: 'Pregnancy increases your fluid needs. Aim for 10 cups of water a day, love. You and baby will thank you! 💧',
    time: '2 hours ago'
  },
  {
    icon: '🚶',
    title: 'Gentle Movement',
    message: 'A short, gentle walk today can help with swelling, back pain, and mood. Listen to your body! 🌸',
    time: '3 hours ago'
  },
  {
    icon: '🛌',
    title: 'Rest Reminder',
    message: 'Growing a human is hard work! Please rest when you need to. Sleep on your left side when possible. 💗',
    time: 'Today'
  },
  {
    icon: '👶',
    title: 'Baby Update',
    message: 'Your baby\'s senses are developing this week! Talk to them, play soft music — they can hear you! 🎵',
    time: 'Today'
  },
  {
    icon: '🧘',
    title: 'Pregnancy Yoga',
    message: 'Gentle prenatal yoga can ease back pain and prepare your body for birth. Even 15 minutes helps! 🌺',
    time: 'Yesterday'
  }
];

// ===== RENDER NOTIFICATIONS =====
function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;

  const notifs = mode === 'pregnancy' ? pregnancyNotifications : normalNotifications;

  list.innerHTML = notifs.map(notif => `
    <div class="notif-item">
      <div class="notif-item-icon">${notif.icon}</div>
      <div class="notif-item-text">
        <h4>${notif.title}</h4>
        <p>${notif.message}</p>
        <p style="font-size:0.75rem; color: var(--text-light); margin-top: 4px;">${notif.time}</p>
      </div>
    </div>
  `).join('');
}

// ===== TOGGLE NOTIFICATION PANEL =====
function toggleNotifications() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.classList.toggle('open');

  // Render notifications when opened
  if (panel.classList.contains('open')) {
    renderNotifications();
  }
}

// ===== SHOW NOTIFICATION BADGE =====
// Add a small red dot to the bell icon to indicate new notifications
function showNotificationBadge() {
  const btn = document.getElementById('notifBtn');
  if (!btn) return;

  // Only add badge if not already there
  if (!btn.querySelector('.notif-badge')) {
    const badge = document.createElement('span');
    badge.className = 'notif-badge';
    badge.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background: #E91E63;
      border-radius: 50%;
      border: 2px solid white;
    `;
    btn.style.position = 'relative';
    btn.appendChild(badge);
  }
}

// ===== SHOW NOTIFICATION TOAST =====
// Show a brief popup notification
function showToast(icon, title, message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 14px 20px;
    box-shadow: 0 8px 30px rgba(192,81,122,0.2);
    z-index: 500;
    max-width: 360px;
    width: 90%;
    display: flex;
    gap: 12px;
    align-items: center;
    transition: transform 0.4s ease, opacity 0.4s ease;
    font-family: 'Lato', sans-serif;
  `;
  toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icon}</span>
    <div>
      <strong style="font-size: 0.9rem; color: var(--pink-deep);">${title}</strong>
      <p style="font-size: 0.82rem; color: var(--text-mid); margin: 2px 0 0;">${message}</p>
    </div>
  `;

  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(40px)';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// ===== INITIALIZE NOTIFICATIONS =====
// Show notification badge after a short delay
setTimeout(() => showNotificationBadge(), 2000);

// Show a welcome toast notification
setTimeout(() => {
  if (mode === 'pregnancy') {
    showToast('🤰', 'Pregnancy Mode Active', 'Weekly updates and maternal guidance are ready for you, mama! 💗');
  } else {
    showToast('🌸', 'Hello, beautiful!', 'HER has your daily reminders and wellness tips ready. 💗');
  }
}, 3000);
