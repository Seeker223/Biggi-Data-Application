//frontend/context/AuthContext.jsx
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

  /* ---------------------------------------------------------
     1. Test backend connection once
  --------------------------------------------------------- */
  useEffect(() => {
    testBackendConnection();
  }, []);

  /* ---------------------------------------------------------
     2. Load token & user on app start
  --------------------------------------------------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("userToken");
        const storedRefresh = await AsyncStorage.getItem("refreshToken");

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

  /* ---------------------------------------------------------
     3. Refresh user (after deposit, withdraw, games, etc.)
  --------------------------------------------------------- */
  const refreshUser = async () => {
    try {
      if (!token) return;
      const res = await api.get("/auth/me");
      if (res.data?.success) {
        setUser(res.data.user);
        await loadDepositHistory();
      }
    } catch (err) {
      console.log("Refresh user error:", err.response?.data || err);
    }
  };

  /* ---------------------------------------------------------
     4. Load deposit history
  --------------------------------------------------------- */
  const loadDepositHistory = async () => {
    try {
      const res = await api.get("/wallet/deposit-history");
      if (res.data?.success) {
        setDepositHistory(res.data.deposits || []);
        return res.data.deposits;
      }
      return [];
    } catch (err) {
      console.log("Deposit history error:", err.response?.data || err);
      return [];
    }
  };

  /* ---------------------------------------------------------
     5. Update user locally
  --------------------------------------------------------- */
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  /* ---------------------------------------------------------
     6. STORE TOKENS
  --------------------------------------------------------- */
  const storeTokens = async (newToken, newRefresh) => {
    await AsyncStorage.setItem("userToken", newToken);
    await AsyncStorage.setItem("refreshToken", newRefresh);
    setToken(newToken);
    setRefreshToken(newRefresh);
    api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
  };

  /* ---------------------------------------------------------
     7. REGISTER
  --------------------------------------------------------- */
  const register = async (username, email, password, phoneNumber, birthDate) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        phoneNumber,
        birthDate,
      });

      const { token: newToken, refreshToken: newRefresh, user: newUser } = res.data;

      await storeTokens(newToken, newRefresh);
      setUser(newUser);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Registration failed." };
    }
  };

  /* ---------------------------------------------------------
     8. LOGIN
  --------------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, refreshToken: newRefresh, user: loggedInUser } = res.data;

      await storeTokens(newToken, newRefresh);
      setUser(loggedInUser);
      await loadDepositHistory();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Invalid credentials." };
    }
  };

  /* ---------------------------------------------------------
     9. LOGOUT (hard reset)
  --------------------------------------------------------- */
  const logout = async () => {
    await AsyncStorage.multiRemove(["userToken", "refreshToken"]);
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setDepositHistory([]);
  };

  /* ---------------------------------------------------------
     10. REFRESH ACCESS TOKEN
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     11. AXIOS INTERCEPTOR (Auto-refresh token)
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     PROVIDER
  --------------------------------------------------------- */
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        depositHistory,

        login,
        register,
        logout,
        refreshUser,
        updateUser,
        setUser,

        loadDepositHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
