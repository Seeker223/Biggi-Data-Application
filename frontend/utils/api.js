// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Validate Base URL from Expo Environment
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

if (!BASE_URL) {
  console.error("❌ Missing EXPO_PUBLIC_BASE_URL. Set it in .env");
} else {
  console.log("📡 API Base URL:", BASE_URL);
}

// -----------------------------------------------------------
// ⚙️ Axios instance
// -----------------------------------------------------------
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// -----------------------------------------------------------
// 🔐 Attach Token Automatically
// -----------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -----------------------------------------------------------
// 🚫 Global Error Handler
// -----------------------------------------------------------
api.interceptors.response.use(
  (res) => res,
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

// -----------------------------------------------------------
// TEST BACKEND CONNECTION
// -----------------------------------------------------------
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

// -----------------------------------------------------------
// AUTH
// -----------------------------------------------------------
export const loginUser = (payload) => api.post("/auth/login", payload);
export const registerUser = (payload) => api.post("/auth/register", payload);
export const fetchUser = () => api.get("/auth/me");
export const refreshUserBalance = () => api.get("/wallet/balance");

// -----------------------------------------------------------
// WALLET + MONNIFY
// -----------------------------------------------------------
export const createStaticAccount = () =>
  api.get("/monnify/create-static-account");

export const startMonnifyDeposit = (amount) =>
  api.post("/wallet/initiate-monnify-payment", { amount });

// deposit history
export const getDepositHistory = () => api.get("/wallet/deposit-history");

// complete transaction list (optional)
export const getTransactions = () => api.get("/wallet/transactions");

// redeem reward
export const redeemRewards = () => api.post("/wallet/redeem");

// -----------------------------------------------------------
// DATA PURCHASE
// -----------------------------------------------------------
export const buyData = async (payload) => {
  try {
    const res = await api.post("/data/buy", payload);
    return res.data;
  } catch (err) {
    return {
      success: false,
      msg: err.response?.data?.msg || "Failed to purchase data",
    };
  }
};

// history of purchased data
export const getDataPurchaseHistory = () => api.get("/data/history");

// -----------------------------------------------------------
// GAMES
// -----------------------------------------------------------
export const playDailyGame = (numbers) =>
  api.post("/game/daily/play", { numbers });

export const getDailyResult = () => api.get("/game/daily/result");

export const playWeeklyGame = (numbers) =>
  api.post("/game/weekly/play", { numbers });

export const getWeeklyResult = () => api.get("/game/weekly/result");

export const getGameTickets = () => api.get("/game/tickets");

// -----------------------------------------------------------
// LEADERBOARD
// -----------------------------------------------------------
export const getLeaderboard = async () => {
  try {
    const res = await api.get("/data/leaderboard");
    return res.data.leaderboard || [];
  } catch (err) {
    console.log("Failed to load leaderboard", err);
    return [];
  }
};

// -----------------------------------------------------------
// USER PROFILE
// -----------------------------------------------------------
export const updateUserProfile = (payload) =>
  api.put("/user/update-profile", payload);

export const updateAvatar = (formData) =>
  api.put("/user/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default api;
