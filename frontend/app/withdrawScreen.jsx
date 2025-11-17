import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import FloatingBottomNav from "../components/FloatingBottomNav";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const banks = [
  "Access Bank",
  "Guarantee Trust Bank",
  "Wema Bank",
  "Zenith Bank",
  "First Bank",
  "United Bank for Africa",
];

const WithdrawScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(AuthContext);

  const [method, setMethod] = useState("Opay");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showBankList, setShowBankList] = useState(false);

  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧾 SUBMIT WITHDRAWAL
  const handleWithdraw = async () => {
    if (loading) return;

    if (!amount || !accountNumber || !accountName) {
      setErrorText("Please fill in all fields.");
      setErrorModal(true);
      return;
    }

    if (method === "Bank Transfer" && !bank) {
      setErrorText("Please select a bank.");
      setErrorModal(true);
      return;
    }

    if (Number(amount) < 100) {
      setErrorText("Minimum withdrawal is ₦100");
      setErrorModal(true);
      return;
    }

    if (Number(amount) > user?.mainBalance) {
      setErrorText("Insufficient balance.");
      setErrorModal(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        method,
        bank,
        amount: Number(amount),
        accountNumber,
        accountName,
      };

      const res = await api.post("/wallet/withdraw", payload);

      if (res.data.success) {
        await refreshUser();
        setSuccessModal(true);
        setAmount("");
        setAccountNumber("");
        setAccountName("");
        setBank("");
      } else {
        setErrorText(res.data.message || "Withdrawal failed.");
        setErrorModal(true);
      }
    } catch (error) {
      console.log("Withdraw error:", error);
      setErrorText(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Try again."
      );
      setErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Toggle Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, method === "Opay" && styles.activeTab]}
          onPress={() => setMethod("Opay")}
        >
          <Text
            style={[styles.tabText, method === "Opay" && styles.activeTabText]}
          >
            Opay
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            method === "Bank Transfer" && styles.activeTab,
          ]}
          onPress={() => setMethod("Bank Transfer")}
        >
          <Text
            style={[
              styles.tabText,
              method === "Bank Transfer" && styles.activeTabText,
            ]}
          >
            Bank Transfer
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        {method === "Opay" ? "Pay only to Opay accounts" : "Select bank"}
      </Text>

      {/* Bank Dropdown */}
      {method === "Bank Transfer" && (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowBankList(!showBankList)}
          >
            <Text style={styles.placeholder}>
              {bank || "Select bank..."}
            </Text>
            <Ionicons name="chevron-down" size={20} color="gray" />
          </TouchableOpacity>

          {showBankList && (
            <View style={styles.dropdown}>
              <FlatList
                data={banks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setBank(item);
                      setShowBankList(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </>
      )}

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Account number"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={accountNumber}
        onChangeText={setAccountNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Account name"
        placeholderTextColor="#888"
        value={accountName}
        onChangeText={setAccountName}
      />

      {/* Withdraw Button */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleWithdraw}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Processing..." : "Withdraw"}
        </Text>
      </TouchableOpacity>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="checkmark-circle" size={60} color="green" />
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>
              Withdrawal request has been submitted successfully.
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ERROR MODAL */}
      <Modal visible={errorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={60} color="red" />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalMessage}>{errorText}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setErrorModal(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingBottomNav />
    </View>
  );
};

export default WithdrawScreen;

// =============================
// 🎨 STYLES
// =============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#FF7A00",
  },
  tabText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  helperText: {
    marginVertical: 10,
    fontSize: 13,
    color: "#333",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  placeholder: {
    color: "#666",
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    marginBottom: 15,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 15,
    color: "#333",
  },
  button: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 15,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
