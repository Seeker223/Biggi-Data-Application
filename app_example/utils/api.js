// utils/api.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🌍 Base URL for your deployed backend on Render
// ⚠️ Replace this with your actual Render URL (no trailing slash)



// ⚙️ Create an Axios instance

const BASE_URL ="https://biggi-data-reactnative-mern.onrender.com"
const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// 🔐 Automatically attach token to every outgoing request
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("Failed to attach token:", error);
  }
  return config;
});

// 🚫 Handle expired or invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Clearing token...");
      await AsyncStorage.removeItem("userToken");
    }

    if (error.message === "Network Error") {
      console.error("❌ Network Error: Check your internet or backend URL.");
    }

    return Promise.reject(error);
  }
);

export default api;
