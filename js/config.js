/**
 * ============================================================
 * HER – Frontend Config
 * js/config.js
 *
 * Now points to the BACKEND server instead of OpenAI directly.
 * The API key lives safely in backend/.env — never in the browser.
 * ============================================================
 */

const HER_CONFIG = {

  // ===== Backend API URL =====
  // While running locally, the backend runs on port 5000
  // Change this to your deployed backend URL in production
  // e.g. "https://her-api.yourdomain.com"
  API_URL: "http://localhost:5000/api",

  // ===== App Info =====
  APP_NAME: "HER",
  APP_VERSION: "2.0.0",
};
