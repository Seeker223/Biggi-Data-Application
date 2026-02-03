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
// -----------------------------------------------------------
// Feature flags (centralised)
// -----------------------------------------------------------
import { FEATURE_FLAGS } from "../constants/featureFlags";

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

export const redeemRewards = () => {
  if (FEATURE_FLAGS.DISABLE_GAME_AND_REDEEM) {
    return Promise.resolve({ success: false, message: "Redeem is temporarily disabled for review." });
  }
  return api.post("/wallet/redeem");
};

export const withdrawFunds = (payload) => {
  if (FEATURE_FLAGS.DISABLE_GAME_AND_REDEEM) {
    return Promise.resolve({ success: false, message: "Withdrawals are temporarily disabled for review." });
  }
  return api.post("/wallet/withdraw", payload);
};

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
// DATA PURCHASE (UPDATED WITH MONTHLY TRACKING)
// -----------------------------------------------------------
export const buyData = async (payload) => {
  try {
    const res = await api.post("/data/buy", payload);
    
    if (res.data.success) {
      // Update monthly purchase count
      try {
        await updateMonthlyPurchase();
      } catch (monthlyError) {
        console.log("Monthly purchase update failed (non-critical):", monthlyError);
        // Continue anyway - main data purchase succeeded
      }
    }
    
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
// GAMES - DAILY & MONTHLY
// -----------------------------------------------------------
// DAILY GAMES
export const playDailyGame = (numbers) =>
  api.post("/game/daily/play", { numbers });

export const getDailyResult = () => api.get("/game/daily/result");

export const getDailyGameHistory = () => api.get("/game/daily/history");

// MONTHLY GAMES (NEW)
export const getMonthlyEligibility = () => 
  api.get("/game/monthly/eligibility");

export const getMonthlyWinners = (month) => 
  api.get("/game/monthly/winners", month ? { params: { month } } : {});

export const claimMonthlyReward = (month) => 
  api.post("/game/monthly/claim", { month });

export const updateMonthlyPurchase = () => 
  api.post("/game/monthly/purchase");

// GAME TICKETS
export const getGameTickets = () => api.get("/game/tickets");

// WEEKLY GAMES (KEPT FOR BACKWARD COMPATIBILITY - WILL BE DEPRECATED)
export const playWeeklyGame = (numbers) =>
  api.post("/game/weekly/play", { numbers });

export const getWeeklyResult = () => api.get("/game/weekly/result");

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
// GAME HISTORY & STATISTICS
// -----------------------------------------------------------
export const getUserGameStats = async () => {
  try {
    const res = await api.get("/game/stats");
    return res.data;
  } catch (err) {
    console.log("Failed to load game stats:", err);
    return {
      success: false,
      stats: {
        dailyWins: 0,
        monthlyWins: 0,
        totalWins: 0,
        totalPrizeWon: 0,
        tickets: 0,
      }
    };
  }
};

export const claimDailyReward = (gameId) => {
  if (FEATURE_FLAGS.DISABLE_GAME_AND_REDEEM) {
    return Promise.resolve({ success: false, message: "Claiming rewards is temporarily disabled for review." });
  }
  return api.post("/game/daily/claim", { gameId });
};

export const claimMonthlyReward = (month) => {
  if (FEATURE_FLAGS.DISABLE_GAME_AND_REDEEM) {
    return Promise.resolve({ success: false, message: "Claiming monthly rewards is temporarily disabled for review." });
  }
  return api.post("/game/monthly/claim", { month });
};

// -----------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------
export const getNotifications = () => api.get("/user/notifications");
export const markNotificationsAsRead = () => api.post("/user/notifications/read");

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

// -----------------------------------------------------------
// DATA BUNDLE MANAGEMENT
// -----------------------------------------------------------
export const getAvailableBundles = () => api.get("/data/bundles");
export const getBundleCategories = () => api.get("/data/categories");

// -----------------------------------------------------------
// BULK DATA PURCHASE (FOR MONTHLY QUALIFICATION)
// -----------------------------------------------------------
export const bulkPurchaseData = async (bundles) => {
  try {
    const res = await api.post("/data/bulk-purchase", { bundles });
    
    if (res.data.success) {
      // Update monthly purchase count for each bundle
      try {
        await updateMonthlyPurchase();
      } catch (monthlyError) {
        console.log("Monthly purchase update failed:", monthlyError);
      }
    }
    
    return res.data;
  } catch (err) {
    return {
      success: false,
      msg: err.response?.data?.msg || "Failed to purchase bundles",
    };
  }
};

// -----------------------------------------------------------
// DRAW SCHEDULES
// -----------------------------------------------------------
export const getDrawSchedules = async () => {
  try {
    const res = await api.get("/game/schedules");
    return res.data;
  } catch (err) {
    console.log("Failed to load draw schedules:", err);
    return {
      success: false,
      schedules: {
        daily: { time: "19:30", timezone: "WAT", recurring: "daily" },
        monthly: { time: "23:59", timezone: "WAT", recurring: "monthly" },
      }
    };
  }
};

// -----------------------------------------------------------
// PRIZE DISTRIBUTION
// -----------------------------------------------------------
export const getPrizeDistribution = (type = "daily") => 
  api.get(`/game/prizes/${type}`);

// -----------------------------------------------------------
// WINNER VERIFICATION
// -----------------------------------------------------------
export const verifyWinnerStatus = (drawType, drawDate) =>
  api.post("/game/verify-winner", { drawType, drawDate });

// -----------------------------------------------------------
// GAME RULES & TERMS
// -----------------------------------------------------------
export const getGameRules = (gameType = "daily") =>
  api.get(`/game/rules/${gameType}`);

// -----------------------------------------------------------
// TICKET MANAGEMENT
// -----------------------------------------------------------
export const getTicketHistory = () => api.get("/game/tickets/history");
export const purchaseTickets = (quantity) => api.post("/game/tickets/purchase", { quantity });
export const giftTicket = (recipientId, message) => 
  api.post("/game/tickets/gift", { recipientId, message });

// -----------------------------------------------------------
// REFERRAL SYSTEM (IF APPLICABLE)
// -----------------------------------------------------------
export const getReferralStats = () => api.get("/user/referrals");
export const generateReferralLink = () => api.post("/user/referrals/generate");

// -----------------------------------------------------------
// GAME ANALYTICS
// -----------------------------------------------------------
export const getGameAnalytics = (period = "monthly") =>
  api.get(`/game/analytics/${period}`);

export default api;