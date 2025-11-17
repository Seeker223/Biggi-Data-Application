// context/AuthContext.jsx

import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { testBackendConnection } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /* ---------------------------------------------------------
     1. Test backend connectivity on app startup
  --------------------------------------------------------- */
  useEffect(() => {
    testBackendConnection();
  }, []);

  /* ---------------------------------------------------------
     2. Load logged-in user from /auth/me
  --------------------------------------------------------- */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!token) {
          setAuthLoading(false);
          return;
        }

        // Attach token to axios
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Fetch user data
        const res = await api.get("/auth/me");

        if (res.data?.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.log("Auth load error:", error.response?.data || error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  /* ---------------------------------------------------------
     3. Refresh user (after deposit, redeem, profile updates)
  --------------------------------------------------------- */
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data?.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.log("Refresh user failed:", error.response?.data || error);
    }
  };

  /* ---------------------------------------------------------
     4. REGISTER
  --------------------------------------------------------- */
  const register = async (
    username,
    email,
    password,
    phoneNumber,
    birthDate
  ) => {
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
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Registration failed. Try again later.",
      };
    }
  };

  /* ---------------------------------------------------------
     5. LOGIN
  --------------------------------------------------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      await AsyncStorage.setItem("userToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Invalid login credentials.",
      };
    }
  };

  /* ---------------------------------------------------------
     6. FORGOT PASSWORD
  --------------------------------------------------------- */
  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgotpassword", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Unable to send password reset link.",
      };
    }
  };

  /* ---------------------------------------------------------
     7. RESET PASSWORD
  --------------------------------------------------------- */
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, {
        password: newPassword,
      });

      const { newToken } = res.data;

      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      await refreshUser();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Password reset failed.",
      };
    }
  };

  /* ---------------------------------------------------------
     8. SEND EMAIL VERIFICATION
  --------------------------------------------------------- */
  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Failed to send verification email.",
      };
    }
  };

  /* ---------------------------------------------------------
     9. CONFIRM EMAIL VERIFICATION
  --------------------------------------------------------- */
  const confirmVerification = async (token) => {
    try {
      const res = await api.get(`/auth/confirm-verification/${token}`);

      const { jwt, user } = res.data;

      await AsyncStorage.setItem("userToken", jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;

      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Email verification failed.",
      };
    }
  };

  /* ---------------------------------------------------------
     10. LOGOUT
  --------------------------------------------------------- */
  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  /* ---------------------------------------------------------
     PROVIDER
  --------------------------------------------------------- */
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
        refreshUser,
        setUser, // optional direct setter
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
