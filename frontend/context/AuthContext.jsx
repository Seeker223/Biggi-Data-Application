// frontend/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { testBackendConnection } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [depositHistory, setDepositHistory] = useState([]);

  /* ---------------------------------------------------------
     1. Test backend connection once (safe)
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

        if (!storedToken) {
          setAuthLoading(false);
          return;
        }

        setToken(storedToken);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;

        const res = await api.get("/auth/me");

        if (res.data?.success) {
          setUser(res.data.user);
          await loadDepositHistory();
        }
      } catch (err) {
        console.log("Auth load error:", err.response?.data || err);

        // 🔒 Invalid token → force logout
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
     6. REGISTER
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

      const { token: newToken, refreshToken, user: newUser } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Registration failed. Try again later.",
      };
    }
  };

  /* ---------------------------------------------------------
     7. LOGIN
  --------------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token: newToken, refreshToken, user: loggedInUser } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(loggedInUser);

      await loadDepositHistory();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Invalid login credentials.",
      };
    }
  };

  /* ---------------------------------------------------------
     8. LOGOUT (hard reset)
  --------------------------------------------------------- */
  const logout = async () => {
    await AsyncStorage.multiRemove(["userToken", "refreshToken"]);
    delete api.defaults.headers.common.Authorization;

    setToken(null);
    setUser(null);
    setDepositHistory([]);
  };

  /* ---------------------------------------------------------
     9. PASSWORD & EMAIL ACTIONS
  --------------------------------------------------------- */
  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgotpassword", { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Unable to send reset mail.",
      };
    }
  };

  const resetPassword = async (tokenParam, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${tokenParam}`, {
        password: newPassword,
      });

      const { token: newToken, refreshToken } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setToken(newToken);

      await refreshUser();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Password reset failed.",
      };
    }
  };

  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Failed to send verification mail.",
      };
    }
  };

  const confirmVerification = async (verifyToken) => {
    try {
      const res = await api.get(
        `/auth/confirm-verification/${verifyToken}`
      );

      const { jwt, refreshToken, user: verifiedUser } = res.data;

      await AsyncStorage.setItem("userToken", jwt);
      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      api.defaults.headers.common.Authorization = `Bearer ${jwt}`;

      setToken(jwt);
      setUser(verifiedUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.error ||
          "Verification failed.",
      };
    }
  };

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

        forgotPassword,
        resetPassword,

        sendVerificationEmail,
        confirmVerification,

        loadDepositHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
