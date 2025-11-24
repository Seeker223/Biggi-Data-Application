//context/AuthContext
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { testBackendConnection } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    } catch (err) {
      console.log("Refresh user error:", err.response?.data || err);
    }
  };

  /* ---------------------------------------------------------
     4. Update user locally (used for tickets, balance, etc.)
  --------------------------------------------------------- */
  const updateUser = (updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  /* ---------------------------------------------------------
     5. REGISTER
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
     6. LOGIN
  --------------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token: newToken, user: loggedInUser } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(loggedInUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Invalid login credentials.",
      };
    }
  };

  /* ---------------------------------------------------------
     7. FORGOT PASSWORD
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

  /* ---------------------------------------------------------
     8. RESET PASSWORD
  --------------------------------------------------------- */
  const resetPassword = async (tokenParam, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${tokenParam}`, {
        password: newPassword,
      });

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

  /* ---------------------------------------------------------
     9. VERIFY EMAIL
  --------------------------------------------------------- */
  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to send verification mail.",
      };
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
      return {
        success: false,
        error: err.response?.data?.error || "Verification failed.",
      };
    }
  };

  /* ---------------------------------------------------------
     10. LOGOUT
  --------------------------------------------------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };
const getDepositHistory = async () => {
  try {
    const res = await api.get("/wallet/deposit-history");
    if (res.data.success) return res.data.deposits;
  } catch (err) {
    console.log("Deposit history error:", err.response?.data || err);
    return [];
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

        login,
        register,
        logout,

        forgotPassword,
        resetPassword,

        sendVerificationEmail,
        confirmVerification,

        refreshUser,
        updateUser,
        setUser,
        getDepositHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
