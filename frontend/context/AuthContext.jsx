// context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ main: 0, reward: 0 });
  const [authLoading, setAuthLoading] = useState(true);

  // --------------------------------
  // Load user if token exists
  // --------------------------------
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          await fetchWallet();
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setAuthLoading(false);
      }
    };
    loadUser();
  }, []);

  // --------------------------------
  // Register
  // --------------------------------
  const register = async (username, email, password) => {
    try {
      const res = await api.post("/auth/register", { username, email, password });
      const { token, user } = res.data;
      await AsyncStorage.setItem("userToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      await fetchWallet();
      return { success: true };
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || "Registration failed." };
    }
  };

  // --------------------------------
  // Login
  // --------------------------------
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      await AsyncStorage.setItem("userToken", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      await fetchWallet();
      return { success: true };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return { success: false, error: error.response?.data?.error || "Invalid credentials." };
    }
  };

  // --------------------------------
  // Forgot Password
  // --------------------------------
  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/auth/forgotpassword", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("Forgot password error:", error.response?.data || error);
      return { success: false, error: error.response?.data?.error || "Failed to send reset link." };
    }
  };

  // --------------------------------
  // Reset Password
  // --------------------------------
  const resetPassword = async (token, newPassword) => {
    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { password: newPassword });
      const { newToken } = res.data;
      await AsyncStorage.setItem("userToken", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      setUser({ token: newToken });
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error.response?.data || error);
      return { success: false, error: error.response?.data?.error || "Reset password failed." };
    }
  };

  // --------------------------------
  // Send Verification Email
  // --------------------------------
  const sendVerificationEmail = async (email) => {
    try {
      const res = await api.post("/auth/verify-email", { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("Email verification error:", error.response?.data || error);
      return { success: false, error: error.response?.data?.error || "Verification email failed." };
    }
  };

  // --------------------------------
  // Confirm Verification
  // --------------------------------
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
      return { success: false, error: error.response?.data?.error || "Verification failed." };
    }
  };

  // --------------------------------
  // Wallet Functions
  // --------------------------------
  const fetchWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setWallet({
        main: res.data.mainBalance || 0,
        reward: res.data.rewardBalance || 0,
      });
    } catch (error) {
      console.error("Wallet fetch error:", error.response?.data || error);
    }
  };

  const deposit = async (amount) => {
    try {
      const res = await api.post("/wallet/deposit", { amount });
      await fetchWallet();
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Deposit failed." };
    }
  };

  const withdraw = async (amount) => {
    try {
      const res = await api.post("/wallet/withdraw", { amount });
      await fetchWallet();
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Withdraw failed." };
    }
  };

  const redeemReward = async () => {
    try {
      const res = await api.post("/wallet/redeem");
      await fetchWallet();
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || "Redeem failed." };
    }
  };

  // --------------------------------
  // Logout
  // --------------------------------
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      setUser(null);
      setWallet({ main: 0, reward: 0 });
      delete api.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --------------------------------
  // Export context
  // --------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        authLoading,
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
        sendVerificationEmail,
        confirmVerification,
        deposit,
        withdraw,
        redeemReward,
        fetchWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// // context/AuthContext.jsx
// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../utils/api";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   // --------------------------
//   // Load user if token exists
//   // --------------------------
//   useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem("userToken");
//         if (token) {
//           // Optionally, fetch user profile here if your backend has /me
//           setUser({ token });
//         }
//       } catch (error) {
//         console.error("Error loading user:", error);
//       } finally {
//         setAuthLoading(false);
//       }
//     };
//     loadUser();
//   }, []);

//   // --------------------------
//   // REGISTER
//   // --------------------------
//  const register = async (username, email, password) => {
//   try {
//     console.log("Registering at:", api.defaults.baseURL + "/auth/register");
//     const res = await api.post("/auth/register", { username, email, password });
//     const { token } = res.data;
//     await AsyncStorage.setItem("userToken", token);
//     setUser({ username, email, token });
//     return { success: true };
//   } catch (error) {
//     console.error("Register error:", error.response?.data || error.message);
//     return {
//       success: false,
//       error:
//         error.response?.data?.error ||
//         "Registration failed. Please try again.",
//     };
//   }
// };


//   // --------------------------
//   // LOGIN
//   // --------------------------
//   const login = async (email, password) => {
//     try {
//       const res = await api.post("/auth/login", { email, password });
//       const { token } = res.data;
//       await AsyncStorage.setItem("userToken", token);
//       setUser({ email, token });
//       return { success: true };
//     } catch (error) {
//       console.error("Login error:", error.response?.data || error.message);
//       return {
//         success: false,
//         error: error.response?.data?.error || "Invalid credentials.",
//       };
//     }
//   };

//   // --------------------------
//   // LOGOUT
//   // --------------------------
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem("userToken");
//       setUser(null);
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   // --------------------------
//   // FORGOT PASSWORD
//   // --------------------------
//   const forgotPassword = async (email) => {
//     try {
//       const res = await api.post("/auth/forgotpassword", { email });
//       return { success: true, message: res.data.data };
//     } catch (error) {
//       console.error("Forgot password error:", error.response?.data || error);
//       return {
//         success: false,
//         error:
//           error.response?.data?.error ||
//           "Failed to send reset link. Try again later.",
//       };
//     }
//   };

//   // --------------------------
//   // RESET PASSWORD
//   // --------------------------
//   const resetPassword = async (token, newPassword) => {
//     try {
//       const res = await api.put(`/auth/resetpassword/${token}`, {
//         password: newPassword,
//       });
//       const { token: newToken } = res.data;
//       await AsyncStorage.setItem("userToken", newToken);
//       setUser({ token: newToken });
//       return { success: true };
//     } catch (error) {
//       console.error("Reset password error:", error.response?.data || error);
//       return {
//         success: false,
//         error:
//           error.response?.data?.error || "Reset password failed. Token invalid.",
//       };
//     }
//   };

//   // --------------------------
//   // SEND VERIFICATION EMAIL
//   // --------------------------
//   const sendVerificationEmail = async (email) => {
//     try {
//       const res = await api.post("/auth/verify-email", { email });
//       return { success: true, message: res.data.data };
//     } catch (error) {
//       console.error("Email verification error:", error.response?.data || error);
//       return {
//         success: false,
//         error:
//           error.response?.data?.error ||
//           "Could not send verification email. Try again later.",
//       };
//     }
//   };

//   // --------------------------
//   // CONFIRM VERIFICATION
//   // --------------------------
//   const confirmVerification = async (token) => {
//     try {
//       const res = await api.get(`/auth/confirm-verification/${token}`);
//       const { token: jwt } = res.data;
//       await AsyncStorage.setItem("userToken", jwt);
//       setUser({ token: jwt });
//       return { success: true };
//     } catch (error) {
//       console.error("Confirm verification error:", error.response?.data || error);
//       return {
//         success: false,
//         error:
//           error.response?.data?.error ||
//           "Verification link invalid or expired.",
//       };
//     }
//   };

//   // --------------------------
//   // EXPORT CONTEXT
//   // --------------------------
//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         authLoading,
//         register,
//         login,
//         logout,
//         forgotPassword,
//         resetPassword,
//         sendVerificationEmail,
//         confirmVerification,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
