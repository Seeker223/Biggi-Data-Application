import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
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

  const handleInputChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
  };

  const handleVerifyPin = async () => {
    try {
      setLoading(true);
      const enteredPin = pin.join("");
      const res = await api.post("/auth/verify-pin", { email, pin: enteredPin });

      if (res.data.success) {
        Alert.alert("Success", "PIN verified successfully!");
        router.push("/(auth)/login");
      } else {
        Alert.alert("Error", "Invalid PIN. Please try again.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Verification failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    try {
      setLoading(true);
      await api.post("/auth/send-pin", { email });
      Alert.alert("Success", "A new PIN has been sent to your email.");
    } catch (err) {
      Alert.alert("Error", "Failed to resend PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Security Pin</Text>
        <Text style={styles.subHeader}>Enter Security Pin From Your Email</Text>

        {/* PIN Input Boxes */}
        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(text) => handleInputChange(text, index)}
              maxLength={1}
              keyboardType="numeric"
              style={styles.pinInput}
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
            {loading ? "Verifying..." : "Accept"}
          </Text>
        </TouchableOpacity>

        {/* Resend PIN Button */}
        <TouchableOpacity
          onPress={handleResendPin}
          disabled={loading}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryButtonText}>
            {loading ? "Sending..." : "Send Again"}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontWeight: "600",
    color: "#111",
    marginBottom: 24,
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
    borderRadius: 50,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
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
});
