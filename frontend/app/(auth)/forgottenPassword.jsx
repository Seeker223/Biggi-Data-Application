import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNextStep = async () => {
    if (!email) {
      return Alert.alert("Missing Email", "Please enter your registered email address.");
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        "Email Sent 🎉",
        "A password reset link has been sent to your email.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } else {
      Alert.alert("Error", res.error || "Something went wrong, please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address below and we'll send you a link to reset your password.
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="example@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Next Step Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleNextStep}
          style={[styles.button, styles.primaryButton]}
        >
          <Text style={styles.buttonText}>{loading ? "Sending..." : "Next Step"}</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.secondaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Social Auth */}
        <Text style={styles.orText}>or sign up with</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#000",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputLabel: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  button: {
    width: "85%",
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#000",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  orText: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 24,
    marginBottom: 12,
  },
  socialContainer: {
    flexDirection: "row",
    gap: 20,
  },
  socialButton: {
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 50,
    padding: 10,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 13,
  },
  footerLink: {
    color: "#F97316",
    fontSize: 13,
    fontWeight: "600",
  },
});
