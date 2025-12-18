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

const DepositScreen = ({ navigation }) => {
  const { user, refreshUser, getDepositHistory } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

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

  const enteredAmount =
    isNaN(Number(amount)) || Number(amount) <= 0 ? 0 : Number(amount);
  const totalAmount = enteredAmount + SERVICE_CHARGE;

  const isValidAmount = () => !isNaN(Number(amount)) && Number(amount) > 0;

  /* ---------------- TX REF ---------------- */
  const generateTransactionRef = () => {
    return `flw_tx_ref_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  };

  /* ---------------- VERIFY PAYMENT ---------------- */
  const handleOnRedirect = async (data) => {
    setShowConfirm(false);

    console.log("Flutterwave redirect data:", data);

    if (data?.status !== "successful") {
      showToast("Payment cancelled", "error");
      return;
    }

    try {
      showToast("Verifying payment...", "info");

      const res = await api.post("/wallet/verify-flutterwave", {
        tx_ref: data.tx_ref,
      });

      if (res.data.success) {
        showToast("Wallet credited successfully", "success");
        setAmount("");

        await refreshUser();
        if (getDepositHistory) await getDepositHistory();
      } else {
        showToast(res.data.message || "Verification failed", "error");
      }
    } catch (err) {
      console.error("Verification error:", err.response?.data || err);
      showToast("Verification failed. Contact support.", "error");
    }
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

      {/* HEADER */}
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
        <Text style={styles.breakdownText}>Amount: ₦{enteredAmount}</Text>
        <Text style={styles.breakdownText}>
          Service Charge: ₦{SERVICE_CHARGE}
        </Text>
        <Text style={styles.breakdownTextBold}>Total: ₦{totalAmount}</Text>
      </View>

      {isValidAmount() ? (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => setShowConfirm(true)}
        >
          <Text style={styles.payText}>Pay ₦{totalAmount}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.payButton, { opacity: 0.6 }]} disabled>
          <Text style={styles.payText}>Enter valid amount</Text>
        </TouchableOpacity>
      )}

      {/* CONFIRM MODAL */}
      <Modal transparent visible={showConfirm} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>

            <Text style={styles.modalText}>Amount: ₦{enteredAmount}</Text>
            <Text style={styles.modalText}>
              Service Charge: ₦{SERVICE_CHARGE}
            </Text>
            <Text style={styles.modalTextBold}>Total: ₦{totalAmount}</Text>

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
                  authorization:
                    process.env.EXPO_PUBLIC_FLUTTERWAVE_KEY,
                  customer: {
                    email: user?.email,
                    phonenumber: user?.phoneNumber,
                    name: user?.username,
                  },
                  amount: totalAmount,
                  currency: "NGN",
                  payment_options: "card,banktransfer,ussd",
                }}
                onRedirect={handleOnRedirect}
                customButton={(props) => (
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={props.onPress}
                    disabled={props.disabled || props.isInitializing}
                  >
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
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { marginBottom: 20 },
  label: { color: "#555", marginBottom: 8 },
  input: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  breakdown: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  breakdownText: { fontSize: 16, marginBottom: 4 },
  breakdownTextBold: { fontSize: 18, fontWeight: "700" },
  payButton: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  payText: { color: "#fff", fontWeight: "700" },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 0,
    padding: 12,
    borderRadius: 10,
    zIndex: 1000,
  },
  toastText: { color: "#fff", textAlign: "center" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  modalText: { fontSize: 16 },
  modalTextBold: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    backgroundColor: "#FF7A00",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 5,
  },
});
