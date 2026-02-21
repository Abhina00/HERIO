/**
 * ============================================================
 * HER – Auth JavaScript (js/auth.js)
 *
 * Handles login and signup forms.
 * Now calls the BACKEND API instead of using localStorage directly.
 *
 * Flow:
 *   User submits form
 *   → Call backend API (AuthAPI.login / AuthAPI.signup)
 *   → Backend hashes password, verifies, returns JWT token
 *   → We store token in localStorage
 *   → Redirect to mode.html
 * ============================================================
 */

// ===== HANDLE LOGIN =====
async function handleLogin(event) {
  event.preventDefault(); // Prevent page refresh

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorDiv = document.getElementById("loginError");
  const btn      = event.target.querySelector("button[type=submit]");

  // Clear previous errors
  errorDiv.style.display = "none";

  // Show loading state on button
  btn.disabled    = true;
  btn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

  try {
    // Call backend login endpoint
    await AuthAPI.login({ email, password });

    // Success! Redirect to mode selection
    window.location.href = "mode.html";

  } catch (err) {
    // Show the error from backend (e.g. "Incorrect email or password")
    errorDiv.textContent  = "❌ " + err.message;
    errorDiv.style.display = "block";

    // Reset button
    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login to HER';
  }
}


// ===== HANDLE SIGNUP =====
async function handleSignup(event) {
  event.preventDefault();

  const name     = document.getElementById("signupName").value.trim();
  const email    = document.getElementById("signupEmail").value.trim();
  const age      = document.getElementById("signupAge").value;
  const password = document.getElementById("signupPassword").value;
  const errorDiv = document.getElementById("signupError");
  const successDiv = document.getElementById("signupSuccess");
  const btn      = event.target.querySelector("button[type=submit]");

  // Clear previous messages
  errorDiv.style.display   = "none";
  successDiv.style.display = "none";

  // Client-side validation before hitting the API
  if (password.length < 6) {
    errorDiv.textContent  = "⚠️ Password must be at least 6 characters.";
    errorDiv.style.display = "block";
    return;
  }

  // Show loading state
  btn.disabled  = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

  try {
    // Call backend signup endpoint
    const data = await AuthAPI.signup({ name, email, password, age });

    // Show success message
    successDiv.textContent  = `🎉 Welcome to HER, ${data.user.name}! Redirecting...`;
    successDiv.style.display = "block";

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = "mode.html";
    }, 1200);

  } catch (err) {
    errorDiv.textContent  = "❌ " + err.message;
    errorDiv.style.display = "block";

    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-heart"></i> Create My Account';
  }
}
