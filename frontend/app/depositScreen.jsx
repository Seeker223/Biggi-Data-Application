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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

// NOTE: Contract code (for reference) — DO NOT put secret keys in client.
// Monnify Contract Code: 5845875672

const DepositScreen = ({ navigation }) => {
  const { refreshUser } = useContext(AuthContext);

  const [method, setMethod] = useState("online"); // online | manual
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("card"); // card | bank (if you wish)
  const [selectedBank, setSelectedBank] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [accountNumbers, setAccountNumbers] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // WebView / Monnify state
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [webviewLoading, setWebviewLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Bank list (for manual selection UI)
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
    if (method === "manual") {
      fetchVirtualAccount();
    }
  }, [method]);

  // Fetch reserved/static accounts for the logged in user
  const fetchVirtualAccount = async () => {
    try {
      setLoadingAccounts(true);
      // Your backend endpoint that returns reserved accounts for the user.
      // I used the route we discussed earlier. Ensure your backend uses req.user from protect middleware.
      const res = await api.get("/wallet/create-static-account");
      // res.data.accounts expected
      setAccountNumbers(res.data.accounts || []);
    } catch (e) {
      console.log("Virtual account fetch error:", e.response?.data || e.message);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // animate success modal
  const showModal = () => {
    setShowSuccess(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  // Validate amount
  const isValidAmount = () => {
    const n = Number(amount);
    return !isNaN(n) && n > 0;
  };

  // ========== ONLINE (Monnify Hosted Checkout) ==========
  // 1) Call backend to create a Monnify transaction/checkout (backend hits Monnify)
  // 2) Backend returns a checkout URL (Monnify hosted checkout)
  // 3) Open WebView to that URL
  // 4) Detect redirect URL containing success (status=success) -> close webview, refresh user, show success modal
  const initiateMonnifyCheckout = async () => {
    if (!isValidAmount()) {
      Alert.alert("Invalid amount", "Please enter a valid amount to deposit.");
      return;
    }

    try {
      setWebviewLoading(true);
      // POST to backend to create a transaction and get a checkout URL
      // Backend endpoint: POST /wallet/initiate-monnify-payment  { amount }
      // Backend should call Monnify API and return { checkoutUrl } (or { redirectUrl })
      const res = await api.post("/wallet/initiate-monnify-payment", {
        amount: Number(amount),
      });

      const url = res.data.checkoutUrl || res.data.redirectUrl || null;

      if (!url) {
        console.log("No checkout URL returned", res.data);
        Alert.alert("Payment error", "Could not start payment. Try again.");
        setWebviewLoading(false);
        return;
      }

      setCheckoutUrl(url);
      setShowWebView(true);
    } catch (error) {
      console.log("initiateMonnifyCheckout error:", error.response?.data || error.message);
      Alert.alert("Payment error", error.response?.data?.error || "Failed to start payment.");
    } finally {
      setWebviewLoading(false);
    }
  };

  // Handle WebView navigation changes to detect success/cancel
  const handleWebViewNavChange = (navState) => {
    const { url } = navState;
    if (!url) return;

    // ---- IMPORTANT ----
    // Your backend/Monnify should redirect to a URL containing a success indicator.
    // For example: https://your-frontend/callback?status=success&reference=xxxx
    // This code checks for "status=success" in the URL and treats it as successful payment.
    // Adjust this check to match the actual return/redirect URL your backend/Monnify setup uses.
    // --------------------

    try {
      const lower = url.toLowerCase();

      if (lower.includes("status=success") || lower.includes("payment=successful") || lower.includes("transactionstatus=paid") ) {
        // Close webview, refresh user balances, show success modal
        setShowWebView(false);
        setCheckoutUrl(null);
        showModal();

        // Refresh user (pull latest balances from /auth/me)
        refreshUser?.();
      } else if (lower.includes("status=cancel") || lower.includes("cancel")) {
        // user cancelled or payment failed
        setShowWebView(false);
        setCheckoutUrl(null);
        Alert.alert("Payment cancelled", "You cancelled the payment.");
      }
    } catch (e) {
      // ignore parse errors
    }
  };

  // ========== MANUAL / STATIC VA ==========
  // User will copy account details and make bank transfer; backend will receive webhook when money is credited.
  const handleCopyAccount = (acc) => {
    // you can implement Clipboard.setString(accountNumber) to copy to clipboard
    Alert.alert("Account copied", `${acc.accountNumber} — ${acc.bankName}`);
  };

  // A simple UI action to "I've paid" which will call backend to re-check (optional)
  const handleIvePaid = async () => {
    // If you provide a manual-check endpoint on backend, call it here.
    // Alternatively user waits for webhook to update balances; we can call refreshUser to fetch latest user.
    try {
      await refreshUser?.();
      Alert.alert("Check complete", "We refreshed your account. If payment was received, your balance will update.");
    } catch (e) {
      Alert.alert("Error", "Could not refresh. Try again.");
    }
  };

  // mock pay now for manual UI fallback
  const handlePayNow = () => {
    if (method === "online") {
      initiateMonnifyCheckout();
    } else {
      // manual: show instructions or confirm button
      if (!selectedBank) {
        Alert.alert("Select bank", "Please select a bank account above or copy one of the accounts.");
        return;
      }
      if (!isValidAmount()) {
        Alert.alert("Invalid amount", "Please enter a valid amount to deposit.");
        return;
      }
      // Show modal that instructs user to transfer to selected account
      showModal();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* METHOD TOGGLE */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, method === "online" && styles.toggleActive]}
          onPress={() => setMethod("online")}
        >
          <Text style={[styles.toggleText, method === "online" && styles.toggleTextActive]}>
            Online
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, method === "manual" && styles.toggleActive]}
          onPress={() => setMethod("manual")}
        >
          <Text style={[styles.toggleText, method === "manual" && styles.toggleTextActive]}>
            Manual
          </Text>
        </TouchableOpacity>
      </View>

      {/* ONLINE MODE */}
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
            <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentType("card")}>
              <View style={[styles.radioCircle, paymentType === "card" && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentType("bank")}>
              <View style={[styles.radioCircle, paymentType === "bank" && styles.radioSelected]} />
              <Text style={styles.radioLabel}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayNow}
            disabled={webviewLoading}
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
          {/* MANUAL MODE - show reserved accounts */}
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
                    <Text style={{ fontWeight: "700", fontSize: 16 }}>{item.accountNumber}</Text>
                    <Text style={{ color: "#666" }}>{item.reservedAccountName}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <TouchableOpacity
                      onPress={() => handleCopyAccount(item)}
                      style={{ marginBottom: 6 }}
                    >
                      <Text style={{ color: "#FF7A00", fontWeight: "700" }}>Copy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBank(item.bankName);
                      }}
                      style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: selectedBank === item.bankName ? "#FF7A00" : "#eee" }}
                    >
                      <Text style={{ color: selectedBank === item.bankName ? "#fff" : "#000" }}>
                        {selectedBank === item.bankName ? "Selected" : "Select"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.label}>No virtual accounts — tap refresh or contact support</Text>
          )}

          <TextInput
            placeholder="Amount"
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.selectInput} onPress={() => setShowBankList(true)}>
            <Text style={{ color: selectedBank ? "#000" : "#999" }}>{selectedBank || "Select Bank"}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.payButton, { marginTop: 20 }]} onPress={handlePayNow}>
            <Text style={styles.payText}>I have paid / Notify</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.payButton, { backgroundColor: "#999", marginTop: 10 }]} onPress={handleIvePaid}>
            <Text style={[styles.payText, { color: "#fff", opacity: 0.95 }]}>Refresh / Check Payment</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.charge}>N100 standard service charge</Text>

      {/* BANK LIST MODAL */}
      <Modal visible={showBankList} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.bankListContainer}>
            <FlatList
              data={banks}
              keyExtractor={(item, index) => index.toString()}
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

      {/* MONNIFY WEBVIEW MODAL */}
      <Modal visible={showWebView} animationType="slide">
        <View style={{ flex: 1 }}>
          <View style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, backgroundColor: "#fff", justifyContent: "space-between" }}>
            <TouchableOpacity onPress={() => { setShowWebView(false); setCheckoutUrl(null); }}>
              <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>

            <Text style={{ fontWeight: "700" }}>Monnify Checkout</Text>

            <TouchableOpacity onPress={() => { setShowWebView(false); setCheckoutUrl(null); }}>
              <Text style={{ color: "#FF7A00", fontWeight: "700" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {checkoutUrl ? (
            <WebView
              source={{ uri: checkoutUrl }}
              onNavigationStateChange={handleWebViewNavChange}
              startInLoadingState
              renderLoading={() => (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 8 }}>Loading payment...</Text>
                </View>
              )}
              onLoadStart={() => setWebviewLoading(true)}
              onLoadEnd={() => setWebviewLoading(false)}
            />
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <Text>No payment URL available.</Text>
              <TouchableOpacity onPress={() => setShowWebView(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: "#FF7A00" }}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>

            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successMessage}>Deposit Successful</Text>

            <TouchableOpacity onPress={() => setShowSuccess(false)} style={styles.exitButton}>
              <Text style={styles.exitText}>Exit</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#d9d9d9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  toggleActive: {
    backgroundColor: "#FF7A00",
  },
  toggleText: {
    color: "#000",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },
  label: {
    color: "#333",
    marginBottom: 8,
  },
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
  payText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  charge: {
    textAlign: "center",
    color: "gray",
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },
  radioLabel: {
    fontSize: 15,
  },
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  accountRow: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  successBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  successIcon: {
    backgroundColor: "#2ecc71",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  successMessage: {
    marginTop: 5,
    fontSize: 16,
  },
  exitButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginTop: 25,
  },
  exitText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
