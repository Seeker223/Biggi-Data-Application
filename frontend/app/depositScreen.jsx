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
import { AuthContext } from "../context/AuthContext";

// ⬇️ Correct updated imports
import {
  createStaticAccount,
  startMonnifyDeposit,
} from "../utils/api";

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

  useEffect(() => {
    if (method === "manual") loadVirtualAccounts();

    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [method]);

  // Load user static virtual accounts
  const loadVirtualAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await createStaticAccount();
      const accs = res.data.accounts || [];

      setAccountNumbers(accs);
      if (!accs.length) showToast("No virtual accounts assigned yet.", "error");
    } catch (err) {
      console.log("Error fetching accounts:", err);
      showToast("Failed to load virtual accounts.", "error");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const showToast = (msg, type = "info", duration = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: Platform.OS === "ios" ? 48 : 20,
      duration: ANIM_DURATION,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    toastTimeoutRef.current = setTimeout(() => hideToast(), duration);
  };

  const hideToast = () => {
    Animated.timing(toastAnim, {
      toValue: -120,
      duration: ANIM_DURATION,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setToastVisible(false);
      setToastMessage("");
    });
  };

  const openSheet = () => {
    setSheetVisible(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
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
      duration: 150,
      useNativeDriver: true,
    }).start(() =>
      setCenterModal({ visible: false, type: "success", title: "", message: "" })
    );
  };

  const isValidAmount = () =>
    !isNaN(Number(amount)) && Number(amount) >= 100;

  // START MONNIFY CHECKOUT
  const initiateDeposit = async () => {
    if (!isValidAmount()) {
      openCenterModal("error", "Invalid amount", "Enter a valid deposit amount.");
      return;
    }

    try {
      closeSheet();
      setWebviewLoading(true);

      const res = await startMonnifyDeposit(Number(amount));

      const url =
        res.data.checkoutUrl ||
        res.data.redirectUrl ||
        res.data.paymentUrl ||
        null;

      if (!url) {
        openCenterModal("error", "Error", "Could not create payment session.");
        return;
      }

      setCheckoutUrl(url);
      setShowWebView(true);
    } catch (err) {
      console.log("startMonnifyDeposit error:", err);
      openCenterModal("error", "Error", "Failed to start Monnify payment.");
    } finally {
      setWebviewLoading(false);
    }
  };

  const handleWebViewNavChange = (navState) => {
    const current = navState?.url?.toLowerCase() || "";

    if (current.includes("success=true") || current.includes("status=success")) {
      setShowWebView(false);
      setCheckoutUrl(null);

      openCenterModal("success", "Payment Successful", "Your deposit is complete.");
      refreshUser();
      return;
    }

    if (current.includes("cancel") || current.includes("failed")) {
      setShowWebView(false);
      setCheckoutUrl(null);

      openCenterModal(
        "error",
        "Payment Cancelled",
        "You cancelled or the payment failed."
      );

      refreshUser();
    }
  };

  const handleCopyAccount = async (acc) => {
    try {
      await Clipboard.setStringAsync(acc.accountNumber);
      showToast("Copied to clipboard", "success");
    } catch {
      showToast("Copy failed", "error");
    }
  };

  const handleIvePaid = async () => {
    refreshUser();
    showToast("Refreshing balance...", "info");
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  const centerScale = centerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Toast */}
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

      {/* Header */}
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
            style={[styles.toggleText, method === "online" && styles.toggleTextActive]}
          >
            Online
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, method === "manual" && styles.toggleActive]}
          onPress={() => setMethod("manual")}
        >
          <Text
            style={[styles.toggleText, method === "manual" && styles.toggleTextActive]}
          >
            Manual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Online Payment */}
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

          <TouchableOpacity
            style={styles.payButton}
            onPress={initiateDeposit}
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
          {/* Manual Payment */}
          <Text style={styles.label}>Transfer to any of these accounts</Text>

          {loadingAccounts ? (
            <ActivityIndicator />
          ) : accountNumbers.length ? (
            <FlatList
              data={accountNumbers}
              keyExtractor={(item, i) => item.accountNumber + i}
              renderItem={({ item }) => (
                <View style={styles.accountRow}>
                  <View>
                    <Text style={styles.label}>{item.bankName}</Text>
                    <Text style={{ fontSize: 17, fontWeight: "700" }}>
                      {item.accountNumber}
                    </Text>
                    <Text style={{ color: "#666" }}>
                      {item.reservedAccountName}
                    </Text>
                  </View>

                  <View>
                    <TouchableOpacity
                      style={{ marginBottom: 5 }}
                      onPress={() => handleCopyAccount(item)}
                    >
                      <Text style={{ color: "#FF7A00", fontWeight: "700" }}>
                        Copy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text>No virtual account assigned.</Text>
          )}

          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.payButton}
            onPress={handleIvePaid}
          >
            <Text style={styles.payText}>I Have Paid / Refresh</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.charge}>N100 standard service charge</Text>

      {/* WebView Modal */}
      <Modal visible={showWebView} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.webHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowWebView(false);
                setCheckoutUrl(null);
                refreshUser();
              }}
            >
              <Ionicons name="close" size={30} />
            </TouchableOpacity>
          </View>

          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavChange}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webLoading}>
                <ActivityIndicator size="large" color="#FF7A00" />
              </View>
            )}
          />
        </SafeAreaView>
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
    marginBottom: 20,
  },
  toggleButton: { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleActive: { backgroundColor: "#FF7A00" },
  toggleText: { color: "#000" },
  toggleTextActive: { color: "#fff", fontWeight: "800" },
  label: { color: "#555", marginBottom: 8 },
  input: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  payButton: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  payText: { color: "#fff", fontWeight: "700" },
  charge: { textAlign: "center", color: "#666", marginTop: 14 },
  accountRow: {
    padding: 12,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
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
  webHeader: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#fff",
  },
  webLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
