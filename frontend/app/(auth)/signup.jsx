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
  const [modalType, setModalType] = useState("success"); // "success" | "error"
  const [modalMessage, setModalMessage] = useState("");

  const handleRegister = async () => {
    const { username, email, password, phoneNumber, birthDate, confirmPassword } = form;

    if (!username || !email || !password || !confirmPassword) {
      setModalType("error");
      setModalMessage("Please fill all required fields.");
      setModalVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalType("error");
      setModalMessage("Passwords do not match.");
      setModalVisible(true);
      return;
    }

    setLoading(true);
    const res = await register(username, email, password, phoneNumber, birthDate);
    setLoading(false);

    if (res.success) {
      setModalType("success");
      setModalMessage("Registration successful! A confirmation email has been sent.");
      setModalVisible(true);
    } else {
      setModalType("error");
      setModalMessage(res.error || "Registration failed. Please try again.");
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    if (modalType === "success") {
      router.replace("/(auth)/login");
    }
  };

  return (
    <>
      {/* Main Signup UI */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Create Account</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={form.username}
              onChangeText={(t) => setForm({ ...form, username: t })}
              style={styles.textInput}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="example@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              style={styles.textInput}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              placeholder="+234..."
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.phoneNumber}
              onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
              style={styles.textInput}
            />
          </View>

          {/* Birth Date */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              value={form.birthDate}
              onChangeText={(t) => setForm({ ...form, birthDate: t })}
              style={styles.textInput}
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="••••••••"
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
          </View>

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="••••••••"
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
              {loading ? "Signing Up..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
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
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

//
// ─── STYLES ────────────────────────────────────────────────────────────────
//

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
    fontSize: 24,
    fontWeight: "bold",
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
    marginBottom: 4,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 50,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  termsText: {
    color: "#4B5563",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  termsHighlight: {
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#000",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 24,
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
    width: "80%",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 8,
  },
  modalSuccess: {
    borderColor: "#16A34A",
    borderWidth: 2,
  },
  modalError: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  modalMessage: {
    fontSize: 15,
    color: "#111827",
    textAlign: "center",
    marginVertical: 12,
  },
  modalButton: {
    backgroundColor: "#000",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
