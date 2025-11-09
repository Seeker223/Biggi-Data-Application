// app/forgotpassword.jsx
import React, { useState, useContext } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useRouter } from "expo-router";
import api from "../utils/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    try {
      const res = await api.post("/auth/forgotpassword", { email });
      setMessage(res.data.data || "Check your email for reset link.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
      setMessage("");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Forgot Password</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        onChangeText={setEmail}
      />
      {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
      {message ? <Text style={{ color: "green" }}>{message}</Text> : null}
      <Button title="Send Reset Link" onPress={handleForgotPassword} />
      <Button title="Back to Login" onPress={() => router.push("/login")} />
    </View>
  );
}
