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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

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

  const ROOT = process.env.EXPO_PUBLIC_BASE_URL || "";

  useEffect(() => {
    if (method === "manual") fetchVirtualAccount();
  }, [method]);

  const fetchVirtualAccount = async () => {
    if (!ROOT) {
      showToast("Missing backend base URL (EXPO_PUBLIC_BASE_URL).", "error");
      return;
    }

    try {
      setLoadingAccounts(true);
      const token = await AsyncStorage.getItem("userToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${ROOT}/api/monnify/create-static-account`, {
        headers,
        timeout: 15000,
      });
      const accounts = res.data.accounts || [];
      setAccountNumbers(accounts);
      if (!accounts.length)
        showToast("No virtual accounts returned from server.", "error");
    } catch (err) {
      console.log("Virtual account fetch error:", err.response?.data || err.message);
      showToast("Failed to load virtual accounts.", "error");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const showToast = (message, type = "info", duration = 3000) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: Platform.OS === "ios" ? 48 : 20,
      duration: ANIM_DURATION,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();

    setTimeout(() => {
      hideToast();
    }, duration);
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
    }).start(() => {
      setCenterModal({
        visible: false,
        type: "success",
        title: "",
        message: "",
      });
    });
  };

  const isValidAmount = () => {
    const n = Number(amount);
    return !isNaN(n) && n > 0;
  };

  const initiateMonnifyCheckout = async () => {
    if (!isValidAmount()) {
      openCenterModal(
        "error",
        "Invalid amount",
        "Please enter a valid amount to deposit."
      );
      return;
    }

    try {
      setWebviewLoading(true);

      const res = await api.post("/wallet/initiate-monnify-payment", {
        amount: Number(amount),
      });

      const url =
        res.data.checkoutUrl ||
        res.data.redirectUrl ||
        res.data.paymentUrl ||
        null;

      if (!url) {
        openCenterModal(
          "error",
          "Payment error",
          "Could not start payment. Try again."
        );
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
    const url = navState?.url?.toLowerCase() || "";

    if (url.includes("status=success") || url.includes("payment=successful")) {
      setShowWebView(false);
      setCheckoutUrl(null);
      openCenterModal(
        "success",
        "Payment success",
        "Deposit completed successfully."
      );
      refreshUser?.();
    } else if (url.includes("status=cancel") || url.includes("cancel")) {
      setShowWebView(false);
      setCheckoutUrl(null);
      openCenterModal(
        "error",
        "Payment cancelled",
        "You cancelled the payment."
      );
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
      showToast(
        "We refreshed your account. If payment has arrived, your balance will update.",
        "info"
      );
    } catch {
      showToast("Could not refresh. Try again.", "error");
    }
  };

  const handlePayNow = () => {
    if (!isValidAmount()) {
      openCenterModal(
        "error",
        "Invalid amount",
        "Please enter a valid amount to deposit."
      );
      return;
    }

    if (method === "online") {
      openSheet();
    } else {
      openCenterModal(
        "info",
        "Manual payment",
        `Transfer ₦${Number(amount).toLocaleString()} to the selected bank account above.`
      );
    }
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const centerScale = centerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const centerTranslateY = centerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

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
                  ? "#2ecc71"
                  : "#333",
            },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, method === "online" && styles.toggleActive]}
          onPress={() => setMethod("online")}
        >
          <Text
            style={[
              styles.toggleText,
              method === "online" && styles.toggleTextActive,
            ]}
          >
            Online
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, method === "manual" && styles.toggleActive]}
          onPress={() => setMethod("manual")}
        >
          <Text
            style={[
              styles.toggleText,
              method === "manual" && styles.toggleTextActive,
            ]}
          >
            Manual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Online */}
      {method === "online" ? (
        <>
          <Text style={styles.label}>Pay with Monnify</Text>

          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPaymentType("card")}
            >
              <View
                style={[
                  styles.radioCircle,
                  paymentType === "card" && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioLabel}>Card</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPaymentType("bank")}
            >
              <View
                style={[
                  styles.radioCircle,
                  paymentType === "bank" && styles.radioSelected,
                ]}
              />
              <Text style={styles.radioLabel}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={initiateMonnifyCheckout}
          >
            {webviewLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Manual payment */}
          <Text style={styles.label}>Pay to any of these accounts</Text>

          {loadingAccounts ? (
            <ActivityIndicator />
          ) : accountNumbers.length > 0 ? (
            <FlatList
              data={accountNumbers}
              keyExtractor={(item, idx) => `${item.accountNumber}-${idx}`}
              renderItem={({ item }) => (
                <View style={styles.accountRow}>
                  <View>
                    <Text style={styles.label}>{item.bankName}</Text>
                    <Text style={{ fontWeight: "700", fontSize: 16 }}>
                      {item.accountNumber}
                    </Text>
                    <Text style={{ color: "#666" }}>
                      {item.reservedAccountName || item.accountName}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity
                      onPress={() => handleCopyAccount(item)}
                      style={{ marginBottom: 6 }}
                    >
                      <Text style={{ color: "#FF7A00", fontWeight: "700" }}>
                        Copy
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedBank(item.bankName)}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor:
                          selectedBank === item.bankName ? "#FF7A00" : "#eee",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedBank === item.bankName ? "#fff" : "#000",
                        }}
                      >
                        {selectedBank === item.bankName ? "Selected" : "Select"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.label}>No accounts found.</Text>
          )}

          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowBankList(true)}
          >
            <Text style={{ color: selectedBank ? "#000" : "#999" }}>
              {selectedBank || "Select Bank"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payText}>I have paid / Notify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: "#999", marginTop: 10 }]}
            onPress={handleIvePaid}
          >
            <Text style={[styles.payText, { color: "#fff" }]}>Refresh</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.charge}>N100 standard service charge</Text>

      {/* Bank list */}
      <Modal visible={showBankList} transparent animationType="fade">
        <View style={styles.overlay}>
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
                  style={{ paddingVertical: 10 }}
                >
                  <Text style={{ fontSize: 16 }}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* WebView */}
      <Modal visible={showWebView} animationType="slide">
        <View style={{ flex: 1 }}>
          <View
            style={{
              height: 56,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setShowWebView(false);
                setCheckoutUrl(null);
              }}
            >
              <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>

            <Text style={{ fontWeight: "700" }}>Monnify Checkout</Text>

            <TouchableOpacity
              onPress={() => {
                setShowWebView(false);
                setCheckoutUrl(null);
              }}
            >
              <Text style={{ color: "#FF7A00", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {checkoutUrl ? (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNavChange}
              startInLoadingState
              renderLoading={() => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 8 }}>Loading payment...</Text>
                </View>
              )}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>No payment URL available.</Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Bottom Sheet */}
      <Modal visible={sheetVisible} transparent animationType="none">
        <View style={styles.sheetOverlay}>
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Confirm Deposit</Text>
            <Text style={styles.sheetText}>
              You are about to deposit ₦{Number(amount || 0).toLocaleString()}
            </Text>

            <View style={{ flexDirection: "row", marginTop: 18 }}>
              <TouchableOpacity
                style={[styles.payButton, { flex: 1, marginRight: 8 }]}
                onPress={() => {
                  closeSheet();
                  initiateMonnifyCheckout();
                }}
              >
                <Text style={styles.payText}>Proceed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.payButton, { flex: 1, backgroundColor: "#ddd" }]}
                onPress={closeSheet}
              >
                <Text style={[styles.payText, { color: "#000" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Center modal */}
      <Modal visible={centerModal.visible} transparent animationType="none">
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.centerBox,
              {
                transform: [
                  { translateY: centerTranslateY },
                  { scale: centerScale },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.centerIcon,
                {
                  backgroundColor:
                    centerModal.type === "success"
                      ? "#2ecc71"
                      : centerModal.type === "error"
                      ? "#ff5252"
                      : "#FF7A00",
                },
              ]}
            >
              <Ionicons
                name={
                  centerModal.type === "success"
                    ? "checkmark"
                    : centerModal.type === "error"
                    ? "alert-circle"
                    : "information"
                }
                size={36}
                color="#fff"
              />
            </View>

            <Text style={styles.centerTitle}>{centerModal.title}</Text>
            <Text style={styles.centerMessage}>{centerModal.message}</Text>

            <TouchableOpacity
              onPress={closeCenterModal}
              style={[styles.exitButton, { marginTop: 16 }]}
            >
              <Text style={styles.exitText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
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
    backgroundColor: "#fff",
    width: "80%",
    maxHeight: "60%",
    borderRadius: 12,
    padding: 15,
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
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    minHeight: 260,
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
  },
  exitText: { textAlign: "center", color: "#fff", fontSize: 16, fontWeight: "600" },
});
