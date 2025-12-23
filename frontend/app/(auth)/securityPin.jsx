// frontend/app/(auth)/securityPin.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api";
import { Ionicons } from "@expo/vector-icons";

export default function SecurityPinScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  // Create refs for input fields
  const inputRefs = useRef([]);

  // Auto-focus first input and start timer
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Start 30-second timer for resend
    setTimer(30);
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (!text && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPin = async () => {
    const enteredPin = pin.join("");
    
    if (enteredPin.length !== 6) {
      Alert.alert("Error", "Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-pin", { email, pin: enteredPin });

      if (res.data.success) {
        Alert.alert(
          "Success", 
          res.data.message || "Account verified successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                // Check if tokens are returned
                if (res.data.token) {
                  // Store tokens locally
                  // In a real app, you'd update AuthContext here
                  // For simplicity, redirect to login
                  router.replace("/(auth)/login");
                } else {
                  router.replace("/(auth)/login");
                }
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", res.data.error || "Invalid PIN. Please try again.");
        // Clear PIN on error
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.log("Verify PIN error:", err.response?.data || err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.details?.[0] || 
                      "Verification failed. Try again later.";
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    if (timer > 0) {
      Alert.alert("Please wait", `You can resend in ${timer} seconds`);
      return;
    }

    try {
      setResendLoading(true);
      const res = await api.post("/auth/resend-pin", { email });

      if (res.data.success) {
        Alert.alert("Success", res.data.message || "New verification code sent.");
        // Reset timer to 30 seconds
        setTimer(30);
      } else {
        Alert.alert("Error", res.data.error || "Failed to resend code.");
      }
    } catch (err) {
      console.log("Resend PIN error:", err.response?.data || err);
      const errorMsg = err.response?.data?.error || "Failed to resend verification code.";
      Alert.alert("Error", errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={styles.header}>Security Pin</Text>
        <Text style={styles.subHeader}>
          Enter the 6-digit verification code sent to:
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        {/* PIN Input Boxes */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => inputRefs.current[index] = ref}
              value={digit}
              onChangeText={(text) => handleInputChange(text, index)}
              maxLength={1}
              keyboardType="numeric"
              style={styles.pinInput}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyPin}
          disabled={loading}
          style={[styles.button, styles.primaryButton]}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>

        {/* Resend PIN Button */}
        <TouchableOpacity
          onPress={handleResendPin}
          disabled={resendLoading || timer > 0}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryButtonText}>
            {resendLoading ? "Sending..." : timer > 0 ? `Resend (${timer}s)` : "Resend Code"}
          </Text>
        </TouchableOpacity>

        {/* Back to login */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.backLink}
        >
          <Ionicons name="arrow-back" size={16} color="#666" />
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 8,
  },
  subHeader: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  emailText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 30,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  pinInput: {
    width: 45,
    height: 45,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
    fontWeight: "bold",
  },
  button: {
    width: "70%",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#000",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  backText: {
    color: "#666",
    marginLeft: 6,
    fontSize: 14,
  },
});