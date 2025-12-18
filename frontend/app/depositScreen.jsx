import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PayWithFlutterwave } from "flutterwave-react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const SERVICE_CHARGE = 0;
const POLL_INTERVAL = 4000; // 4 seconds
const POLL_TIMEOUT = 30000; // 30 seconds

const DepositScreen = ({ navigation }) => {
  const { user, refreshUser, getDepositHistory } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle | pending | success | failed
  const [activeTxRef, setActiveTxRef] = useState(null);

  const pollTimer = useRef(null);
  const pollStartTime = useRef(null);

  const toastAnim = useRef(new Animated.Value(-120)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  /* ---------------- TOAST ---------------- */
  const showToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: Platform.OS === "ios" ? 48 : 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 3000);
  };

  /* ---------------- AMOUNT ---------------- */
  const enteredAmount = isNaN(Number(amount)) || Number(amount) <= 0 ? 0 : Number(amount);
  const totalAmount = enteredAmount + SERVICE_CHARGE;
  const isValidAmount = () => !isNaN(Number(amount)) && Number(amount) > 0;

  /* ---------------- TX REF ---------------- */
  const generateTransactionRef = () => {
    if (!user?._id) throw new Error("User not authenticated");
    return `flw_${user._id}_${Date.now()}`;
  };

  /* ---------------- POLLING FALLBACK ---------------- */
  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  };

  const startPolling = (tx_ref) => {
    pollStartTime.current = Date.now();
    pollTimer.current = setInterval(async () => {
      const elapsed = Date.now() - pollStartTime.current;
      if (elapsed > POLL_TIMEOUT) {
        stopPolling();
        setPaymentStatus("failed");
        showToast("Payment confirmation timed out", "error");
        return;
      }

      try {
        const res = await api.get(`/wallet/deposit-status/${tx_ref}`);
        if (res.data.status === "success") {
          stopPolling();
          setPaymentStatus("success");
          showToast("Payment confirmed", "success");
          setAmount("");
          await refreshUser();
          if (getDepositHistory) await getDepositHistory();
        }

        if (res.data.status === "failed" || res.data.status === "reversed") {
          stopPolling();
          setPaymentStatus("failed");
          showToast("Payment failed or reversed", "error");
        }
      } catch (err) {
        // silent retry
      }
    }, POLL_INTERVAL);
  };

  /* ---------------- VERIFY REDIRECT ---------------- */
  const handleOnRedirect = async (data) => {
    setShowConfirm(false);

    if (data?.status !== "successful") {
      setPaymentStatus("failed");
      showToast("Payment cancelled", "error");
      return;
    }

    try {
      setPaymentStatus("pending");
      setActiveTxRef(data.tx_ref);
      showToast("Payment processing...", "info");

      await api.post("/wallet/verify-flutterwave", { tx_ref: data.tx_ref });

      showToast("Awaiting confirmation...", "info");
      startPolling(data.tx_ref);
    } catch (err) {
      setPaymentStatus("failed");
      showToast("Verification failed", "error");
      console.error("Verify error:", err.response?.data || err);
    }
  };

  /* ---------------- STATUS BANNER ---------------- */
  const renderStatusBanner = () => {
    if (paymentStatus === "idle") return null;

    const config = {
      pending: { text: "Payment processing… Please wait", color: "#FF9800" },
      success: { text: "Payment successful 🎉", color: "#28a745" },
      failed: { text: "Payment failed or reversed", color: "#ff5252" },
    };

    return (
      <View style={[styles.statusBanner, { backgroundColor: config[paymentStatus].color }]}>
        <Text style={styles.statusText}>{config[paymentStatus].text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor:
                toastType === "error"
                  ? "#ff5252"
                  : toastType === "success"
                  ? "#28a745"
                  : "#333",
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {renderStatusBanner()}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Enter Amount to Deposit</Text>
      <TextInput
        placeholder="₦ Amount"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.breakdown}>
        <Text>Amount: ₦{enteredAmount}</Text>
        <Text>Service Charge: ₦{SERVICE_CHARGE}</Text>
        <Text style={{ fontWeight: "700" }}>Total: ₦{totalAmount}</Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, (!isValidAmount() || paymentStatus === "pending") && { opacity: 0.6 }]}
        disabled={!isValidAmount() || paymentStatus === "pending"}
        onPress={() => setShowConfirm(true)}
      >
        <Text style={styles.payText}>
          {paymentStatus === "pending" ? "Processing…" : `Pay ₦${totalAmount}`}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>

            <Text>Amount: ₦{enteredAmount}</Text>
            <Text>Total: ₦{totalAmount}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <PayWithFlutterwave
                options={{
                  tx_ref: generateTransactionRef(),
                  authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_KEY,
                  customer: { email: user?.email, phonenumber: user?.phoneNumber, name: user?.username },
                  amount: totalAmount,
                  currency: "NGN",
                }}
                onRedirect={handleOnRedirect}
                customButton={(props) => (
                  <TouchableOpacity style={styles.modalButton} onPress={props.onPress}>
                    <Text style={{ color: "#fff" }}>Confirm & Pay</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DepositScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 15 },
  label: { marginBottom: 8 },
  input: { backgroundColor: "#E5E5E5", borderRadius: 10, padding: 14 },
  breakdown: { marginVertical: 15, padding: 12, backgroundColor: "#F5F5F5", borderRadius: 10 },
  payButton: { backgroundColor: "#FF7A00", padding: 15, borderRadius: 12, alignItems: "center" },
  payText: { color: "#fff", fontWeight: "700" },
  toast: { position: "absolute", left: 20, right: 20, top: 0, padding: 12, borderRadius: 10, zIndex: 1000 },
  toastText: { color: "#fff", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { backgroundColor: "#FF7A00", padding: 12, borderRadius: 10 },
  statusBanner: { padding: 12, borderRadius: 10, marginBottom: 10 },
  statusText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
