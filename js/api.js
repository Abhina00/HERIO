// HER – API Helper
// Connects frontend to the backend server

const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("herToken");
}

function authHeader() {
  const token = getToken();
  return token ? { "Authorization": "Bearer " + token } : {};
}

async function apiRequest(endpoint, options = {}) {
  const url = BASE_URL + endpoint;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// ===== AUTH =====
const AuthAPI = {
  signup: async ({ name, email, password, age }) => {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, age }),
    });
    localStorage.setItem("herToken", data.token);
    localStorage.setItem("herUser", JSON.stringify(data.user));
    return data;
  },

  login: async ({ email, password }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("herToken", data.token);
    localStorage.setItem("herUser", JSON.stringify(data.user));
    return data;
  },

  me: async () => {
    return await apiRequest("/auth/me");
  },

  logout: () => {
    localStorage.removeItem("herToken");
    localStorage.removeItem("herUser");
    localStorage.removeItem("herMode");
    window.location.href = "index.html";
  },
};

// ===== CHAT =====
const ChatAPI = {
  sendMessage: async ({ message, mode, history }) => {
    return await apiRequest("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message, mode, history }),
    });
  },

  getHistory: async (mode = "normal") => {
    return await apiRequest("/chat/history?mode=" + mode);
  },

  clearHistory: async (mode = "normal") => {
    return await apiRequest("/chat/clear?mode=" + mode, {
      method: "DELETE",
    });
  },
};

// ===== USER =====
const UserAPI = {
  getProfile: async () => {
    return await apiRequest("/user/profile");
  },

  updateProfile: async ({ name, age }) => {
    return await apiRequest("/user/update", {
      method: "PUT",
      body: JSON.stringify({ name, age }),
    });
  },
};

// ===== AUTH GUARD =====
// Call this on protected pages to verify login
async function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return null;
  }
  try {
    const data = await AuthAPI.me();
    localStorage.setItem("herUser", JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    AuthAPI.logout();
    return null;
  }
}