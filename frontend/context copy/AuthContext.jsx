// frontend/context/AuthContext.jsx - UPDATED FOR NO OTP
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { testBackendConnection } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [depositHistory, setDepositHistory] = useState([]);
  
  // Notification state
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(null);

  /* ---------------- Test backend connection once ---------------- */
  useEffect(() => {
    testBackendConnection();
  }, []);

  /* ---------------- Load user & token on app start ---------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");
        const storedLastSeen = await AsyncStorage.getItem("lastSeenNotificationTime");

        if (storedLastSeen) {
          setLastSeenNotificationTime(new Date(storedLastSeen));
        } else {
          const defaultTime = new Date();
          defaultTime.setDate(defaultTime.getDate() - 1);
          setLastSeenNotificationTime(defaultTime);
        }

        if (!storedToken || !storedRefresh) {
          setAuthLoading(false);
          return;
        }

        setToken(storedToken);
        setRefreshToken(storedRefresh);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

        const res = await api.get("/auth/me");
        if (res.data?.success) {
          setUser(res.data.user);
          await loadDepositHistory();
          await calculateNotificationCount();
        }
      } catch (err) {
        console.log("Auth load error:", err.response?.data || err);
        await logout();
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ---------------- Calculate Notification Count ---------------- */
  const calculateNotificationCount = async () => {
    try {
      const newDepositsCount = depositHistory.filter(deposit => {
        if (!lastSeenNotificationTime) return true;
        const depositDate = new Date(deposit.createdAt);
        return depositDate > lastSeenNotificationTime;
      }).length;

      const otherNotifications = 0;
      const totalCount = newDepositsCount + otherNotifications;
      setNotificationCount(totalCount > 9 ? 9 : totalCount);
    } catch (error) {
      console.log("Error calculating notification count:", error);
      setNotificationCount(0);
    }
  };

  /* ---------------- Mark Notifications as Seen ---------------- */
  const markNotificationsAsSeen = async () => {
    try {
      const now = new Date();
      setLastSeenNotificationTime(now);
      setNotificationCount(0);
      await AsyncStorage.setItem("lastSeenNotificationTime", now.toISOString());
    } catch (error) {
      console.log("Error marking notifications as seen:", error);
    }
  };

  /* ---------------- Reset Notification Count ---------------- */
  const resetNotificationCount = () => {
    setNotificationCount(0);
  };

  /* ---------------- Increment Notification Count ---------------- */
  const incrementNotificationCount = () => {
    setNotificationCount(prev => {
      const newCount = prev + 1;
      return newCount > 9 ? 9 : newCount;
    });
  };

  /* ---------------- Refresh user ---------------- */
  const refreshUser = async () => {
    try {
      if (!token) return;
      const res = await api.get("/auth/me");
      if (res.data?.success) {
        setUser(res.data.user);
        await loadDepositHistory();
        await calculateNotificationCount();
      }
    } catch (err) {
      console.log("Refresh user error:", err.response?.data || err);
    }
  };

  /* ---------------- Load deposit history ---------------- */
  const loadDepositHistory = async () => {
    try {
      if (!token) return [];
      const res = await api.get("/wallet/deposit-history");
      if (res.data?.success) {
        setDepositHistory(res.data.deposits || []);
        return res.data.deposits || [];
      }
      return [];
    } catch (err) {
      console.log("Deposit history error:", err.response?.data || err);
      return [];
    }
  };

  /* ---------------- Update user locally ---------------- */
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  /* ---------------- Store tokens ---------------- */
  const storeTokens = async (newToken, newRefresh) => {
    await AsyncStorage.setItem("userToken", newToken);
    await AsyncStorage.setItem("refreshToken", newRefresh);
    setToken(newToken);
    setRefreshToken(newRefresh);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  };

  /* ---------------- Register ---------------- */
  const register = async (username, email, password, phoneNumber, birthDate) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        phoneNumber,
        birthDate,
      });

      // SIMPLIFIED: User gets tokens immediately, no verification
      const { token: newToken, refreshToken: newRefresh, user: newUser } = res.data;
      await storeTokens(newToken, newRefresh);
      setUser(newUser);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Registration failed." };
    }
  };

  /* ---------------- Login ---------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, refreshToken: newRefresh, user: loggedInUser } = res.data;

      await storeTokens(newToken, newRefresh);
      setUser(loggedInUser);
      await loadDepositHistory();
      await calculateNotificationCount();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Invalid credentials." };
    }
  };

  /* ---------------- Logout ---------------- */
  const logout = async () => {
    await AsyncStorage.multiRemove(["userToken", "refreshToken", "lastSeenNotificationTime"]);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setDepositHistory([]);
    setNotificationCount(0);
    setLastSeenNotificationTime(null);
  };

  /* ---------------- Refresh access token ---------------- */
  const refreshAccessToken = async () => {
    if (!refreshToken) return logout();

    try {
      const res = await api.post("/auth/refresh", { refreshToken });
      await AsyncStorage.setItem("userToken", res.data.accessToken);
      setToken(res.data.accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
      return res.data.accessToken;
    } catch (err) {
      console.log("Refresh token failed:", err.response?.data || err);
      await logout();
    }
  };

  /* ---------------- Axios interceptor ---------------- */
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  /* ---------------- PROVIDER ---------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        depositHistory,
        notificationCount,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
        setUser,
        loadDepositHistory,
        markNotificationsAsSeen,
        resetNotificationCount,
        incrementNotificationCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};