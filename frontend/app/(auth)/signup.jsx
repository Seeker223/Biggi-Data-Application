// frontend/app/(auth)/signup.jsx - UPDATED FOR NO OTP
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function SignupScreen() {
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleRegister = async () => {
    const { username, email, password, phoneNumber, birthDate, confirmPassword } = form;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      showModal("Please fill all required fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showModal("Passwords do not match.", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModal("Please enter a valid email address.", "error");
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      showModal("Password must be at least 6 characters long.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await register(username, email, password, phoneNumber, birthDate);
      
      if (res.success) {
        // SIMPLIFIED: No email verification, direct to home
        showModal("Registration successful! Welcome to Biggi Data.", "success");
        
        setTimeout(() => {
          setModalVisible(false);
          router.replace("/(tabs)/homeScreen"); // Direct to home, no verification
        }, 1500);
      } else {
        showModal(res.error || "Registration failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      showModal("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const formatDate = (text) => {
    let cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length >= 4) {
      cleaned = cleaned.substring(0, 4) + '-' + cleaned.substring(4);
    }
    if (cleaned.length >= 7) {
      cleaned = cleaned.substring(0, 7) + '-' + cleaned.substring(7, 9);
    }
    
    setForm({ ...form, birthDate: cleaned });
  };

  const formatPhoneNumber = (text) => {
    let cleaned = text.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    setForm({ ...form, phoneNumber: cleaned });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Biggi Data today</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t })}
              style={styles.textInput}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              placeholder="example@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t.toLowerCase() })}
              style={styles.textInput}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              placeholder="+2348012345678"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={formatPhoneNumber}
              style={styles.textInput}
            />
          </View>

          {/* Birth Date */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Date of Birth *</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={form.birthDate}
              onChangeText={formatDate}
              style={styles.textInput}
              maxLength={10}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secure}
                value={form.password}
                onChangeText={(t) => setForm({ ...form, password: t })}
                style={styles.passwordInput}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.passwordHint}>Minimum 6 characters</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={confirmSecure}
                value={form.confirmPassword}
                onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                style={styles.passwordInput}
              />
              <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
                <Ionicons
                  name={confirmSecure ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to{" "}
            <Text style={styles.termsHighlight}>Terms of Use</Text> and{" "}
            <Text style={styles.termsHighlight}>Privacy Policy</Text>.
          </Text>

          {/* Sign Up Button */}
          <TouchableOpacity
            disabled={loading}
            onPress={handleRegister}
            style={[styles.signupButton, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Signing Up..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          {/* Alternative Options */}
          <View style={styles.alternativeContainer}>
            <View style={styles.divider} />
            <Text style={styles.alternativeText}>or sign up with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Success/Error Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalBox,
              modalType === "success" ? styles.modalSuccess : styles.modalError,
            ]}
          >
            <Ionicons
              name={modalType === "success" ? "checkmark-circle" : "alert-circle"}
              size={48}
              color={modalType === "success" ? "#16A34A" : "#DC2626"}
            />
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>
                {modalType === "success" ? "Continue" : "Try Again"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    backgroundColor: "#000000",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    paddingBottom: 32,
    paddingTop: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#FF8000",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  passwordHint: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsText: {
    color: "#4B5563",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
    lineHeight: 18,
  },
  termsHighlight: {
    fontWeight: "600",
    color: "#000",
  },
  signupButton: {
    backgroundColor: "#000",
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  alternativeContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  alternativeText: {
    color: "#6B7280",
    fontSize: 14,
    marginHorizontal: 12,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  socialButtonText: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 14,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  footerText: {
    color: "#4B5563",
    fontSize: 14,
  },
  footerLink: {
    color: "#FF8000",
    fontWeight: "600",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: "#16A34A",
  },
  modalError: {
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  modalMessage: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    marginVertical: 16,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
});