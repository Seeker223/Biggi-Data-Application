import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error"); // 'success' | 'error'

  const showModal = (message, type = "error") => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) return showModal("Please enter your credentials.");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showModal("Login successful!", "success");
      setTimeout(() => {
        setModalVisible(false);
        router.replace("/(tabs)/homeScreen");
      }, 1200);
    } else {
      showModal(res.error || "Login failed ");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            placeholder="example@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
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

        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          style={[styles.loginButton, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging In..." : "Log In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgottenPassword")}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={styles.signupButton}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.fingerprintText}>
          Use <Text style={styles.fingerprintHighlight}>Fingerprint</Text> To Access
        </Text>

        <Text style={styles.socialText}>or sign up with</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-google" size={22} color="#DB4437" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ✅ Modal Component */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              modalType === "success"
                ? styles.modalSuccess
                : styles.modalError,
            ]}
          >
            <Ionicons
              name={modalType === "success" ? "checkmark-circle" : "alert-circle"}
              size={40}
              color={modalType === "success" ? "#16A34A" : "#DC2626"}
            />
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

//
// ─── STYLES ────────────────────────────────────────────────────────────────
//

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#000",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 50,
    alignItems: "center",
  },
  headerText: {
    color: "#FF8000",
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
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
  loginButton: {
    backgroundColor: "#000",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  forgotButton: { marginTop: 12, alignItems: "center" },
  forgotText: { color: "#6B7280", fontWeight: "500" },
  signupButton: {
    backgroundColor: "#E5E7EB",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
    alignSelf: "center",
  },
  signupButtonText: { color: "#111827", fontWeight: "600", fontSize: 16 },
  fingerprintText: {
    marginTop: 24,
    color: "#4B5563",
    textAlign: "center",
  },
  fingerprintHighlight: { color: "#FF8000", fontWeight: "600" },
  socialText: {
    marginTop: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "center",
    gap: 24,
  },
  socialIcon: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 50,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 24,
    justifyContent: "center",
  },
  footerText: { color: "#4B5563" },
  footerLink: { color: "#FF8000", fontWeight: "600" },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#111827",
    marginVertical: 12,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#FF8000",
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
  modalSuccess: { borderLeftWidth: 5, borderLeftColor: "#16A34A" },
  modalError: { borderLeftWidth: 5, borderLeftColor: "#DC2626" },
});
