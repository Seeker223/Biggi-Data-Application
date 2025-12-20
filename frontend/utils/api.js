// frontend/utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Validate Base URL from Expo Environment
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:5000";

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
// 🔐 Attach access token automatically
// -----------------------------------------------------------
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------------------------------------
// 🔄 Token refresh mechanism (safe for concurrency)
// -----------------------------------------------------------
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

// -----------------------------------------------------------
// 🚫 Global response interceptor
// -----------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // -------------------------------------------------------
    // 🌐 Network & timeout errors
    // -------------------------------------------------------
    if (error.message === "Network Error") {
      console.error("❌ Network Error — backend unreachable");
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout");
      return Promise.reject(error);
    }

    // -------------------------------------------------------
    // 🔁 Handle expired access token (401)
    // -------------------------------------------------------
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          }
        );

        const newAccessToken = res.data.accessToken;

        await AsyncStorage.setItem("userToken", newAccessToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // ❌ Refresh failed → force logout
        await AsyncStorage.multiRemove(["userToken", "refreshToken"]);
        delete api.defaults.headers.common.Authorization;

        console.error("❌ Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------
// 🔌 TEST BACKEND CONNECTION
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

// -----------------------------------------------------------
// WALLET & PAYMENTS (UPDATED)
// -----------------------------------------------------------
export const refreshUserBalance = () => api.get("/wallet/balance");
export const getDepositHistory = () => api.get("/wallet/deposit-history");

export const verifyFlutterwavePayment = (tx_ref) =>
  api.post("/wallet/verify-flutterwave", { tx_ref });

export const getDepositStatus = (tx_ref) =>
  api.get(`/wallet/deposit-status/${tx_ref}`);

export const reconcilePayment = (tx_ref) =>
  api.post("/wallet/reconcile-payment", { tx_ref });

export const redeemRewards = () => api.post("/wallet/redeem");

export const withdrawFunds = (payload) =>
  api.post("/wallet/withdraw", payload);

export const getWithdrawalHistory = async () => {
  try {
    const res = await api.get("/wallet/withdraw-history");
    return res.data;
  } catch (err) {
    console.error("Withdrawal history error:", err);
    return { success: false, withdrawals: [] };
  }
};

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

export const updateAvatar = async (formData) => {
  try {
    const token = await AsyncStorage.getItem("userToken");

    const res = await axios.put(
      `${BASE_URL}/api/v1/user/update-avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❗ Do NOT set Content-Type manually (let Axios handle multipart)
        },
        timeout: 30000, // 30 second timeout for image upload
      }
    );

    return res.data;
  } catch (err) {
    console.log("Avatar upload error:", err.response?.data || err.message);
    return {
      success: false,
      msg: err.response?.data?.msg || "Failed to update avatar",
    };
  }
};

// -----------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------
export const checkConnection = async () => {
  try {
    await api.get("/auth/ping");
    return true;
  } catch {
    return false;
  }
};

export default api;