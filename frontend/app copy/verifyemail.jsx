// app/verifyemail.jsx
import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import api from "../utils/api";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await api.get(`/auth/confirm-verification/${token}`);
        setStatus("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.replace("/login"), 2000);
      } catch (err) {
        setStatus(err.response?.data?.error || "Verification failed.");
      } finally {
        setLoading(false);
      }
    };

    if (token) verifyEmail();
    else setStatus("Invalid verification link.");
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      {loading && <ActivityIndicator size="large" />}
      <Text style={{ fontSize: 18, marginTop: 20 }}>{status}</Text>
      {!loading && <Button title="Back to Login" onPress={() => router.replace("/login")} />}
    </View>
  );
}
