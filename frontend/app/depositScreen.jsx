//frontend/app/depositScreen.jsx
import React, { useState, useContext, useRef, useEffect } from "react";
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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PayWithFlutterwave } from "flutterwave-react-native";
import { AuthContext } from "../context/AuthContext";
import api, { 
  verifyFlutterwavePayment, 
  getDepositStatus, 
  reconcilePayment 
} from "../utils/api";

const SERVICE_CHARGE = 0;
const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 20;
const RECONCILE_ATTEMPTS = 3;

const DepositScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [txRef, setTxRef] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pollTimer = useRef(null);
  const pollCount = useRef(0);
  const reconcileAttempts = useRef(0);
  const currentTxRef = useRef(null);

  /* ---------------- TOAST ---------------- */
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 3500);
  };

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      currentTxRef.current = null;
    };
  }, []);

  /* ---------------- AMOUNT VALIDATION ---------------- */
  const enteredAmount = Number(amount) > 0 ? Number(amount) : 0;
  const totalAmount = enteredAmount + SERVICE_CHARGE;
  const isValidAmount = () => enteredAmount >= 100 && enteredAmount <= 1000000;

  /* ---------------- STOP POLLING ---------------- */
  const stopPolling = () => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
    pollCount.current = 0;
    setIsProcessing(false);
    currentTxRef.current = null;
  };

  /* ---------------- MANUAL RECONCILIATION ---------------- */
  const attemptReconciliation = async (reference) => {
    if (reconcileAttempts.current >= RECONCILE_ATTEMPTS) {
      showToast("Maximum reconciliation attempts reached", "error");
      return false;
    }

    try {
      reconcileAttempts.current += 1;
      showToast(
        `Attempting reconciliation (${reconcileAttempts.current}/${RECONCILE_ATTEMPTS})`,
        "info"
      );

      const response = await reconcilePayment(reference);
      console.log("Reconciliation response:", response.data);

      if (response.data?.success) {
        showToast("Payment reconciled successfully! 🎉", "success");
        await refreshUser();
        setAmount("");
        setPaymentStatus("success");
        stopPolling();
        return true;
      } else {
        showToast(
          response.data?.message || "Reconciliation failed",
          "error"
        );
        return false;
      }
    } catch (error) {
      console.log("Reconciliation error:", error.response?.data || error.message);
      showToast("Reconciliation failed. Try again.", "error");
      return false;
    }
  };

  /* ---------------- ENHANCED POLLING ---------------- */
  const startPolling = async (reference) => {
    stopPolling();
    currentTxRef.current = reference;
    setPaymentStatus("pending");
    setIsProcessing(true);
    showToast("Payment received. Awaiting confirmation…", "info");

    pollTimer.current = setInterval(async () => {
      if (currentTxRef.current !== reference) {
        stopPolling();
        return;
      }

      pollCount.current += 1;

      try {
        const res = await getDepositStatus(reference);
        console.log("Polling response:", res.data);

        if (res.data?.success === false) {
          // API error
          console.log("Polling API error:", res.data);
          return;
        }

        const status = res.data?.status || "pending";

        if (status === "successful") {
          stopPolling();
          setPaymentStatus("success");
          showToast("Wallet credited successfully! 🎉", "success");
          setAmount("");
          await refreshUser();
          return;
        }

        if (status === "failed") {
          stopPolling();
          setPaymentStatus("failed");
          showToast("Payment failed", "error");
          return;
        }

        // If pending for too long, try verification API
        if (pollCount.current === 5) {
          try {
            const verifyRes = await verifyFlutterwavePayment(reference);
            console.log("Verification response:", verifyRes.data);

            if (verifyRes.data?.success) {
              stopPolling();
              setPaymentStatus("success");
              showToast("Payment verified and credited! ✅", "success");
              setAmount("");
              await refreshUser();
              return;
            }
          } catch (verifyError) {
            console.log("Verification attempt failed:", verifyError.message);
          }
        }

        // Final attempt reconciliation
        if (pollCount.current >= MAX_POLL_ATTEMPTS - 3) {
          const reconciled = await attemptReconciliation(reference);
          if (reconciled) {
            return;
          }
        }
      } catch (err) {
        console.log("Polling error:", err.message);
      }

      // Stop polling after max attempts
      if (pollCount.current >= MAX_POLL_ATTEMPTS) {
        stopPolling();
        setPaymentStatus("idle");
        showToast(
          "Payment is still processing. Check your balance shortly.",
          "info"
        );

        // Show manual reconciliation option
        Alert.alert(
          "Payment Processing",
          "Your payment is taking longer than expected. Would you like to manually reconcile?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Reconcile Now",
              onPress: () => attemptReconciliation(reference),
            },
          ]
        );
      }
    }, POLL_INTERVAL);
  };

  /* ---------------- START PAYMENT ---------------- */
  const handleStartPayment = () => {
    if (!isValidAmount()) {
      if (enteredAmount < 100) {
        showToast("Minimum deposit is ₦100", "error");
      } else if (enteredAmount > 1000000) {
        showToast("Maximum deposit is ₦1,000,000", "error");
      }
      return;
    }

    if (isProcessing) {
      showToast("Please wait for current transaction to complete", "info");
      return;
    }

    const reference = `flw_${user._id}_${Date.now()}`;
    setTxRef(reference);
    setShowConfirm(true);
    reconcileAttempts.current = 0;
  };

  /* ---------------- ENHANCED FLUTTERWAVE CALLBACK ---------------- */
  const handleOnRedirect = async (data) => {
    console.log("Flutterwave redirect data:", data);
    setShowConfirm(false);

    if (!data) {
      showToast("Payment process incomplete", "error");
      return;
    }

    if (data.status !== "successful") {
      showToast(`Payment ${data.status}`, "error");
      return;
    }

    // Immediately call verification API
    try {
      setIsProcessing(true);
      showToast("Verifying payment...", "info");

      const verifyRes = await verifyFlutterwavePayment(data.tx_ref);
      console.log("Immediate verification:", verifyRes.data);

      if (verifyRes.data?.success) {
        showToast("Payment verified! Updating balance...", "success");
        await refreshUser();
        setAmount("");
        setIsProcessing(false);
        setPaymentStatus("success");
      } else {
        // Start polling as fallback
        startPolling(data.tx_ref);
      }
    } catch (verifyError) {
      console.log("Immediate verification failed:", verifyError.message);
      // Start polling as fallback
      startPolling(data.tx_ref);
    }
  };

  /* ---------------- STATUS BANNER ---------------- */
  const renderStatusBanner = () => {
    if (paymentStatus === "idle") return null;

    const config = {
      pending: { 
        text: "Payment processing…", 
        color: "#FF9800", 
        icon: "time-outline" 
      },
      success: { 
        text: "Payment successful 🎉", 
        color: "#28a745", 
        icon: "checkmark-circle" 
      },
      failed: { 
        text: "Payment failed", 
        color: "#ff5252", 
        icon: "close-circle" 
      },
    };

    const statusConfig = config[paymentStatus];

    return (
      <View
        style={[
          styles.statusBanner,
          { backgroundColor: statusConfig.color },
        ]}
      >
        <Ionicons
          name={statusConfig.icon}
          size={20}
          color="#fff"
          style={styles.statusIcon}
        />
        <Text style={styles.statusText}>{statusConfig.text}</Text>
      </View>
    );
  };

  /* ---------------- MANUAL RECONCILE BUTTON ---------------- */
  const renderReconcileButton = () => {
    if (paymentStatus !== "pending" || !txRef || !isProcessing) return null;

    return (
      <TouchableOpacity
        style={styles.reconcileButton}
        onPress={() => attemptReconciliation(txRef)}
        disabled={isProcessing}
      >
        <Ionicons name="refresh-circle" size={20} color="#FF7A00" />
        <Text style={styles.reconcileText}>
          Having issues? Tap here to reconcile
        </Text>
      </TouchableOpacity>
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
        <TouchableOpacity
          onPress={() => {
            if (isProcessing) {
              Alert.alert(
                "Transaction in Progress",
                "A payment is being processed. Are you sure you want to leave?",
                [
                  { text: "Stay", style: "cancel" },
                  { text: "Leave", onPress: () => navigation.goBack() },
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deposit Funds</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Enter Amount to Deposit</Text>
        <TextInput
          placeholder="₦ Amount (min ₦100, max ₦1,000,000)"
          keyboardType="numeric"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          editable={!isProcessing}
          placeholderTextColor="#999"
        />

        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Amount:</Text>
            <Text style={styles.breakdownValue}>
              ₦{enteredAmount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Service Charge:</Text>
            <Text style={styles.breakdownValue}>₦{SERVICE_CHARGE}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ₦{totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>

        {renderReconcileButton()}

        <TouchableOpacity
          style={[
            styles.payButton,
            (!isValidAmount() || isProcessing) && styles.payButtonDisabled,
          ]}
          disabled={!isValidAmount() || isProcessing}
          onPress={handleStartPayment}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.payText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payText}>
              Pay ₦{totalAmount.toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color="#666" />
          <Text style={styles.infoText}>
            • Payments usually complete within 1-2 minutes{"\n"}
            • If balance doesn't update, use the reconcile button{"\n"}
            • Contact support if issues persist
          </Text>
        </View>
      </View>

      {/* CONFIRMATION MODAL */}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Payment</Text>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Amount:</Text>
                <Text style={styles.modalDetailValue}>
                  ₦{enteredAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Service Charge:</Text>
                <Text style={styles.modalDetailValue}>₦{SERVICE_CHARGE}</Text>
              </View>
              <View style={[styles.modalDetailRow, styles.modalTotalRow]}>
                <Text style={styles.modalDetailLabel}>Total:</Text>
                <Text style={[styles.modalDetailValue, styles.modalTotal]}>
                  ₦{totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirm(false)}
                disabled={isProcessing}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>

              {txRef && (
                <PayWithFlutterwave
                  options={{
                    tx_ref: txRef,
                    authorization: process.env.EXPO_PUBLIC_FLUTTERWAVE_KEY,
                    customer: {
                      email: user?.email,
                      phonenumber: user?.phoneNumber,
                      name: user?.username,
                    },
                    amount: totalAmount,
                    currency: "NGN",
                  }}
                  onRedirect={handleOnRedirect}
                  customButton={(props) => (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonConfirm]}
                      onPress={props.onPress}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.modalButtonConfirmText}>
                          Confirm & Pay
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DepositScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 20,
    color: "#000",
  },
  breakdown: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF7A00",
  },
  payButton: {
    backgroundColor: "#FF7A00",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  reconcileButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  reconcileText: {
    color: "#FF7A00",
    fontWeight: "600",
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
    lineHeight: 18,
  },
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 0,
    padding: 12,
    borderRadius: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  modalDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  modalDetailLabel: {
    fontSize: 16,
    color: "#666",
  },
  modalDetailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF7A00",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalButtonCancel: {
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  modalButtonConfirm: {
    backgroundColor: "#FF7A00",
    marginLeft: 10,
  },
  modalButtonCancelText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  modalButtonConfirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});