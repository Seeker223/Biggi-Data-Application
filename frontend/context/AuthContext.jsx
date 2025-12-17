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
        if (!storedToken) {
          setAuthLoading(false);
          return;
        }

        setToken(storedToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
        }

        // Load deposit history
        await loadDepositHistory();
      } catch (err) {
        console.log("Auth load error:", err.response?.data || err);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ---------------------------------------------------------
     3. Refresh user (after deposit, withdraw, tickets, etc.)
  --------------------------------------------------------- */
  const refreshUser = async () => {
    try {
      if (!token) return;
      const res = await api.get("/auth/me");
      if (res.data.success) setUser(res.data.user);

      // Refresh deposit history automatically
      await loadDepositHistory();
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
      if (res.data.success) {
        setDepositHistory(res.data.deposits || []);
        return res.data.deposits;
      }
    } catch (err) {
      console.log("Deposit history error:", err.response?.data || err);
      return [];
    }
  };

  /* ---------------------------------------------------------
     5. Update user locally (used for tickets, balance, etc.)
  --------------------------------------------------------- */
  const updateUser = (updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
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

      const { token: newToken, user: newUser } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Registration failed. Try again later.",
      };
    }
  };

  /* ---------------------------------------------------------
     7. LOGIN
  --------------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, user: loggedInUser } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(loggedInUser);

      // Load deposit history after login
      await loadDepositHistory();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Invalid login credentials.",
      };
    }
  };

  /* ---------------------------------------------------------
     8. LOGOUT
  --------------------------------------------------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    setDepositHistory([]);
  };

  /* ---------------------------------------------------------
     9. OTHER AUTH METHODS (forgot/reset password, verify email)
  --------------------------------------------------------- */
  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgotpassword", { email });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Unable to send reset mail.",
      };
    }
  };

  const resetPassword = async (tokenParam, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${tokenParam}`, { password: newPassword });
      const { newToken } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setToken(newToken);
      await refreshUser();

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Password reset failed.",
      };
    }
  };

  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Failed to send verification mail." };
    }
  };

  const confirmVerification = async (verifyToken) => {
    try {
      const res = await api.get(`/auth/confirm-verification/${verifyToken}`);
      const { jwt, user: verifiedUser } = res.data;

      await AsyncStorage.setItem("userToken", jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

      setToken(jwt);
      setUser(verifiedUser);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Verification failed." };
    }
  };

  /* ---------------------------------------------------------
     PROVIDER EXPORT
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

        loadDepositHistory, // manually refresh if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
