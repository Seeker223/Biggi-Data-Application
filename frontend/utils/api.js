// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Validate Base URL
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

if (!BASE_URL) {
  console.error("❌ Missing EXPO_PUBLIC_BASE_URL. Set it in .env or app.json");
} else {
  console.log("📡 API Base URL:", BASE_URL);
}

// ⚙️ Axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// 🔐 Attach Token to Every Request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🚫 Handle Expired Token Globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("🚫 401 Unauthorized — clearing token...");
      await AsyncStorage.removeItem("userToken");
    }

    if (error.message === "Network Error") {
      console.error("❌ Network Error — check backend or internet.");
    }

    if (error.code === "ECONNABORTED") {
      console.error("⏰ Server timeout");
    }

    return Promise.reject(error);
  }
);

// 🧪 Ping server on app startup
export const testBackendConnection = async () => {
  try {
    const res = await api.get("/auth/ping");
    console.log("✅ Backend reachable:", res.data);
    return true;
  } catch (err) {
    console.error("❌ Backend ping failed:", err.message);
    return false;
  }
};

// ---------------------------------------------------------------------------
// 🔐 AUTH
// ---------------------------------------------------------------------------
export const loginUser = (payload) => api.post("/auth/login", payload);
export const registerUser = (payload) => api.post("/auth/register", payload);
export const fetchUser = () => api.get("/auth/me");

// ---------------------------------------------------------------------------
// 💰 WALLET + MONNIFY
// ---------------------------------------------------------------------------

// Create static account (if you expose it)
export const createStaticAccount = () => api.get("/monnify/create-static-account");

// Start deposit using Monnify hosted page or account
export const startMonnifyDeposit = (amount) =>
  api.post("/wallet/initiate-monnify-payment", { amount });

// Get user wallet transactions
export const getTransactions = () => api.get("/wallet/transactions");

// Redeem rewards → mainBalance
export const redeemRewards = () => api.post("/wallet/redeem");

// ---------------------------------------------------------------------------
// 🎮 GAMES (Daily & Weekly Draw)
// ---------------------------------------------------------------------------

// Daily game pick (user plays daily)
export const playDailyGame = (numbers) =>
  api.post("/game/daily/play", { numbers });

// Get today's daily draw result
export const getDailyResult = () => api.get("/game/daily/result");

// Weekly game play
export const playWeeklyGame = (numbers) =>
  api.post("/game/weekly/play", { numbers });

// Weekly results
export const getWeeklyResult = () => api.get("/game/weekly/result");

// User daily/weekly tickets
export const getGameTickets = () => api.get("/game/tickets");

// ---------------------------------------------------------------------------
// 🏆 LEADERBOARD
// ---------------------------------------------------------------------------
export const getLeaderboard = async () => {
  try {
    const res = await api.get("/data/leaderboard");
    return res.data.leaderboard || [];
  } catch (error) {
    console.log("Failed to load leaderboard", error);
    return [];
  }
};

// ---------------------------------------------------------------------------
// 👤 USER PROFILE
// ---------------------------------------------------------------------------
export const updateUserProfile = (payload) =>
  api.put("/user/update-profile", payload);

// Update avatar
export const updateAvatar = (formData) =>
  api.put("/user/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ---------------------------------------------------------------------------
// DEFAULT EXPORT
// ---------------------------------------------------------------------------
export default api;
