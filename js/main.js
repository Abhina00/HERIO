/**
 * ============================================================
 * HER – Main JavaScript
 * js/main.js
 * 
 * Handles landing page interactivity:
 * - Mobile navigation toggle
 * - Scroll animations
 * - Auto-redirect if already logged in
 * ============================================================
 */

// ===== TOGGLE MOBILE MENU =====
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}

// ===== CLOSE MOBILE MENU ON LINK CLICK =====
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.remove('open');
  });
});

// ===== NAVBAR SCROLL EFFECT =====
// Add a subtle shadow to the navbar when scrolled
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 4px 20px rgba(192, 81, 122, 0.12)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

// ===== SCROLL REVEAL ANIMATION =====
// Animate feature cards and other elements when they come into view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Apply initial hidden state to animated elements
document.querySelectorAll('.feature-card, .about-content, .stat').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== AUTO-REDIRECT IF ALREADY LOGGED IN =====
// If a user is already logged in, update the navbar CTA
const existingUser = JSON.parse(localStorage.getItem('herUser'));
if (existingUser) {
  // Update the hero CTA button to go directly to mode selection
  const heroCtas = document.querySelectorAll('.hero-cta a');
  if (heroCtas[0]) {
    heroCtas[0].href = 'mode.html';
    heroCtas[0].innerHTML = '<i class="fas fa-heart"></i> Continue My Journey';
  }
}
