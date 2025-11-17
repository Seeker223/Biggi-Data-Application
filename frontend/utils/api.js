// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Validate Base URL
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

if (!BASE_URL) {
  console.error(
    "❌ Missing EXPO_PUBLIC_BASE_URL in your environment. Please set it in .env or app.json"
  );
} else {
  console.log("📡 API Base URL:", BASE_URL);
}

// ⚙️ Create an Axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s timeout
});

// 🔐 Automatically attach token to every outgoing request
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.warn("⚠️ Failed to attach token:", error);
  }
  return config;
});

// 🚫 Handle expired or invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("🚫 Unauthorized — clearing token...");
      await AsyncStorage.removeItem("userToken");
    }

    if (error.message === "Network Error") {
      console.error("❌ Network Error: Check internet or backend URL.");
    }

    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout — server took too long to respond.");
    }

    return Promise.reject(error);
  }
);

// 🧪 Optional: Ping test on app startup
export const testBackendConnection = async () => {
  try {
    const response = await api.get("/auth/ping");
    console.log("✅ Backend is reachable:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Backend ping failed:", error.message);
    return false;
  }
};


export const getLeaderboard = async () => {
  try {
    const res = await api.get("/data/leaderboard");
    return res.data.leaderboard;
  } catch (error) {
    console.log("Failed to load leaderboard", error);
    return [];
  }
};

export const startMonnifyDeposit = async (amount) => {
  return api.post("/wallet/initiate-monnify-payment", { amount });
};


export default api;
