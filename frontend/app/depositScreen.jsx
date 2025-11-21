// frontend/app/depositScreen.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const { height } = Dimensions.get("window");
const ANIM_DURATION = 300;

const DepositScreen = ({ navigation }) => {
  const { refreshUser } = useContext(AuthContext);

  const [method, setMethod] = useState("online");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("card");
  const [selectedBank, setSelectedBank] = useState("");
  const [showBankList, setShowBankList] = useState(false);

  const [accountNumbers, setAccountNumbers] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [webviewLoading, setWebviewLoading] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const toastTimeoutRef = useRef(null);

  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const [centerModal, setCenterModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });
  const centerAnim = useRef(new Animated.Value(0)).current;

  const banks = [
    "Access Bank",
    "Guarantee Trust Bank",
    "Wema Bank",
    "First Bank",
    "United Bank for Africa",
    "Zenith Bank",
    "Sterling Bank",
    "FCMB",
  ];

  useEffect(() => {
    if (method === "manual") fetchVirtualAccount();
    // cleanup toast timer on unmount
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [method]);

  const fetchVirtualAccount = async () => {
    try {
      setLoadingAccounts(true);
      const res = await api.get("/monnify/create-static-account");
      const accounts = res.data.accounts || [];
      setAccountNumbers(accounts);
      if (!accounts.length) showToast("No virtual accounts available", "error");
    } catch (err) {
      console.log("Virtual account fetch error:", err.response?.data || err.message);
      showToast("Failed to load virtual accounts", "error");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const showToast = (message, type = "info", duration = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: Platform.OS === "ios" ? 48 : 20,
      duration: ANIM_DURATION,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    toastTimeoutRef.current = setTimeout(() => hideToast(), duration);
  };

  const hideToast = () => {
    Animated.timing(toastAnim, {
      toValue: -120,
      duration: ANIM_DURATION,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      setToastVisible(false);
      setToastMessage("");
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
    });
  };

  const openSheet = () => {
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => setSheetVisible(false));
  };

  const openCenterModal = (type, title, message) => {
    setCenterModal({ visible: true, type, title, message });
    centerAnim.setValue(0);
    Animated.spring(centerAnim, {
      toValue: 1,
      friction: 8,
      tension: 70,
      useNativeDriver: true,
    }).start();
  };

  const closeCenterModal = () => {
    Animated.timing(centerAnim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() =>
      setCenterModal({ visible: false, type: "success", title: "", message: "" })
    );
  };

  const isValidAmount = () => !isNaN(Number(amount)) && Number(amount) > 0;

  const initiateMonnifyCheckout = async () => {
    if (!isValidAmount()) {
      openCenterModal("error", "Invalid amount", "Enter a valid deposit amount.");
      return;
    }

    try {
      // close sheet UI immediately to avoid double actions
      closeSheet();
      setWebviewLoading(true);

      const res = await api.post("/wallet/initiate-monnify-payment", {
        amount: Number(amount),
      });

      // try multiple common fields so this works with different backend shapes
      const url =
        res.data.checkoutUrl ||
        res.data.redirectUrl ||
        res.data.paymentUrl ||
        res.data.data?.checkoutUrl ||
        null;

      if (!url) {
        openCenterModal("error", "Payment error", "Could not start payment. Try again.");
        return;
      }

      setCheckoutUrl(url);
      setShowWebView(true);
    } catch (error) {
      console.log("initiateMonnifyCheckout error:", error.response?.data || error.message);
      openCenterModal(
        "error",
        "Payment error",
        error.response?.data?.error || "Failed to start payment."
      );
    } finally {
      setWebviewLoading(false);
    }
  };

  const handleWebViewNavChange = (navState) => {
    const url = (navState?.url || "").toLowerCase();

    // common success indicators
    if (
      url.includes("status=success") ||
      url.includes("payment=successful") ||
      url.includes("success=true") ||
      url.includes("status=completed")
    ) {
      setShowWebView(false);
      setCheckoutUrl(null);
      openCenterModal("success", "Payment success", "Deposit completed successfully.");
      // refresh user immediately to reflect deposit
      refreshUser?.();
      return;
    }

    // cancelled / failed
    if (
      url.includes("status=cancel") ||
      url.includes("cancel") ||
      url.includes("failed") ||
      url.includes("error")
    ) {
      // close but keep message slightly less aggressive for ambiguous urls
      setShowWebView(false);
      setCheckoutUrl(null);
      openCenterModal("error", "Payment cancelled", "You cancelled or payment failed.");
      // still attempt a refresh (safe)
      refreshUser?.();
    }
  };

  const handleCopyAccount = async (acc) => {
    try {
      await Clipboard.setStringAsync(acc.accountNumber);
      showToast(`${acc.accountNumber} copied to clipboard`, "success");
    } catch {
      showToast("Could not copy account", "error");
    }
  };

  const handleIvePaid = async () => {
    try {
      await refreshUser?.();
      showToast("Account refreshed. Your balance is updated if payment has arrived.", "info");
    } catch {
      showToast("Could not refresh. Try again.", "error");
    }
  };

  const handlePayNow = () => {
    if (!isValidAmount()) {
      openCenterModal("error", "Invalid amount", "Please enter a valid amount.");
      return;
    }

    if (method === "online") openSheet();
    else
      openCenterModal(
        "info",
        "Manual payment",
        `Transfer ₦${Number(amount).toLocaleString()} to the selected bank account above.`
      );
  };

  const sheetTranslateY = sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });
  const centerScale = centerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const centerTranslateY = centerAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor: toastType === "error" ? "#ff5252" : toastType === "success" ? "#2ecc71" : "#333",
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity style={[styles.toggleButton, method === "online" && styles.toggleActive]} onPress={() => setMethod("online")}>
          <Text style={[styles.toggleText, method === "online" && styles.toggleTextActive]}>Online</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, method === "manual" && styles.toggleActive]} onPress={() => setMethod("manual")}>
          <Text style={[styles.toggleText, method === "manual" && styles.toggleTextActive]}>Manual</Text>
        </TouchableOpacity>
      </View>

      {/* Online / Manual */}
      {method === "online" ? (
        <>
          <Text style={styles.label}>Pay with Monnify</Text>
          <TextInput placeholder="Amount" style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

          <View style={styles.radioGroup}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentType("card")}>
              <View style={[styles.radioCircle, paymentType === "card" && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentType("bank")}>
              <View style={[styles.radioCircle, paymentType === "bank" && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={initiateMonnifyCheckout}>
            {webviewLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Pay Now</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Pay to any of these accounts</Text>

          {loadingAccounts ? (
            <ActivityIndicator />
          ) : accountNumbers.length ? (
            <FlatList
              data={accountNumbers}
              keyExtractor={(item, idx) => `${item.accountNumber}-${idx}`}
              renderItem={({ item }) => (
                <View style={styles.accountRow}>
                  <View>
                    <Text style={styles.label}>{item.bankName}</Text>
                    <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.accountNumber}</Text>
                    <Text style={{ color: "#666" }}>{item.reservedAccountName || item.accountName}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity onPress={() => handleCopyAccount(item)} style={{ marginBottom: 6 }}>
                      <Text style={{ color: "#FF7A00", fontWeight: "700" }}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedBank(item.bankName)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: selectedBank === item.bankName ? "#FF7A00" : "#eee" }}>
                      <Text style={{ color: selectedBank === item.bankName ? "#fff" : "#000" }}>{selectedBank === item.bankName ? "Selected" : "Select"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.label}>No accounts found.</Text>
          )}

          <TextInput placeholder="Amount" style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

          <TouchableOpacity style={styles.selectInput} onPress={() => setShowBankList(true)}>
            <Text style={{ color: selectedBank ? "#000" : "#999" }}>{selectedBank || "Select Bank"}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payText}>I have paid / Notify</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.payButton, { backgroundColor: "#999", marginTop: 10 }]} onPress={handleIvePaid}>
            <Text style={[styles.payText, { color: "#fff" }]}>Refresh</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.charge}>N100 standard service charge</Text>

      {/* WebView Modal */}
      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 16, backgroundColor: "#fff" }}>
            <TouchableOpacity
              onPress={() => {
                setShowWebView(false);
                setCheckoutUrl(null);
                // refresh when user closes
                refreshUser?.();
              }}
            >
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {checkoutUrl ? (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNavChange}
              startInLoadingState
              renderLoading={() => (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#FF7A00" />
                </View>
              )}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>No payment URL available.</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Bottom Sheet (Confirm Deposit) */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.sheetOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Confirm Deposit</Text>
          <Text style={styles.sheetText}>You are about to deposit ₦{Number(amount || 0).toLocaleString()}</Text>

          <View style={{ flexDirection: "row", marginTop: 18 }}>
            <TouchableOpacity
              style={[styles.payButton, { flex: 1, marginRight: 8 }]}
              onPress={() => {
                // Proceed to Monnify
                initiateMonnifyCheckout();
              }}
            >
              <Text style={styles.payText}>Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.payButton, { flex: 1, backgroundColor: "#ddd" }]} onPress={closeSheet}>
              <Text style={[styles.payText, { color: "#000" }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      {/* Center Modal */}
      {centerModal.visible && (
        <View style={styles.centerOverlay}>
          <Animated.View style={[styles.centerBox, { transform: [{ scale: centerScale }, { translateY: centerTranslateY }] }]}>
            <View style={[styles.centerIcon, { backgroundColor: centerModal.type === "success" ? "#2ecc71" : centerModal.type === "error" ? "#ff5252" : "#3498db" }]}>
              <Ionicons name={centerModal.type === "success" ? "checkmark" : centerModal.type === "error" ? "close" : "information-circle"} size={40} color="#fff" />
            </View>
            <Text style={styles.centerTitle}>{centerModal.title}</Text>
            <Text style={styles.centerMessage}>{centerModal.message}</Text>
            <TouchableOpacity style={styles.exitButton} onPress={closeCenterModal}>
              <Text style={styles.exitText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Bank list selector modal */}
      <Modal visible={showBankList} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowBankList(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={styles.bankListContainer}>
          <FlatList
            data={banks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setSelectedBank(item);
                  setShowBankList(false);
                }}
                style={{ paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 16 }}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DepositScreen;

/* -------------------------- STYLES -------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { marginBottom: 20 },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  toggleButton: { flex: 1, alignItems: "center", paddingVertical: 10 },
  toggleActive: { backgroundColor: "#FF7A00" },
  toggleText: { color: "#000", fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  label: { color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  selectInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    padding: 15,
  },
  payButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  payText: { textAlign: "center", color: "#fff", fontWeight: "700", fontSize: 16 },
  charge: { textAlign: "center", color: "gray", marginTop: 10 },
  radioGroup: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  radioOption: { flexDirection: "row", alignItems: "center", marginRight: 25 },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 8,
  },
  radioSelected: { backgroundColor: "#FF7A00", borderColor: "#FF7A00" },
  radioLabel: { fontSize: 15 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  bankListContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    maxHeight: "50%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  accountRow: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Toast
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 0,
    padding: 10,
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
  },
  toastText: { color: "#fff", textAlign: "center", fontWeight: "600" },

  // Bottom sheet
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    minHeight: 220,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 12,
  },
  sheetHandle: {
    width: 50,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitle: { fontWeight: "700", fontSize: 18, marginTop: 4 },
  sheetText: { color: "#444", marginTop: 8 },

  // Center modal
  centerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerBox: {
    backgroundColor: "#fff",
    padding: 22,
    borderRadius: 14,
    width: "86%",
    alignItems: "center",
  },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  centerTitle: { fontWeight: "800", fontSize: 18 },
  centerMessage: { marginTop: 8, textAlign: "center", color: "#444" },

  exitButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginTop: 25,
    alignItems: "center",
  },
  exitText: { textAlign: "center", color: "#fff", fontSize: 16, fontWeight: "600" },
});
