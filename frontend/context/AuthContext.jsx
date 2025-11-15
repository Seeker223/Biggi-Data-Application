// context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { testBackendConnection } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔌 Test backend
  useEffect(() => {
    testBackendConnection();
  }, []);

  // 🔁 Load user on startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setAuthLoading(false);
          return;
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔄 Refresh user (use this after deposit, withdraw, redeem, purchases)
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // ------------------------------------
  //            AUTH FUNCTIONS
  // ------------------------------------

  // REGISTER
  const register = async (username, email, password, phoneNumber, birthDate) => {
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
        phoneNumber,
        birthDate,
      });

      const { token, user } = res.data;

      await AsyncStorage.setItem("userToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed.",
      };
    }
  };

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      await AsyncStorage.setItem("userToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Invalid credentials.",
      };
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgotpassword", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("Forgot password:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to send reset link.",
      };
    }
  };

  // RESET PASSWORD
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, {
        password: newPassword,
      });

      const { newToken } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      // Refresh user after password reset
      await refreshUser();

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || "Reset password failed.",
      };
    }
  };

  // SEND EMAIL VERIFICATION
  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("Email verification error:", error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to send verification email.",
      };
    }
  };

  // CONFIRM EMAIL VERIFICATION
  const confirmVerification = async (token) => {
    try {
      const res = await api.get(`/auth/confirm-verification/${token}`);
      const { jwt, user } = res.data;

      await AsyncStorage.setItem("userToken", jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      console.error("Confirm verification error:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || "Verification failed.",
      };
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ------------------------------------
  //            PROVIDER VALUE
  // ------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        sendVerificationEmail,
        confirmVerification,
        refreshUser, // ⭐ important for updating balances
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
