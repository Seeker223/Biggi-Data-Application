import React, { useState, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DepositScreen = ({ navigation }) => {
  const [method, setMethod] = useState("online");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("card");
  const [selectedBank, setSelectedBank] = useState("");
  const [showBankList, setShowBankList] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const showModal = () => {
    setShowSuccess(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePayNow = () => {
    // Simulate API call success
    setTimeout(showModal, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Toggle Buttons */}
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
          <Text style={styles.label}>Pay with Paystack</Text>
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
        </>
      ) : (
        <>
          <Text style={styles.label}>
            Pay with Sterling Bank: <Text style={{ fontWeight: "700" }}>0012354682</Text>
          </Text>

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
        </>
      )}

      {/* PAY BUTTON */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
        <Text style={styles.payText}>Pay Now</Text>
      </TouchableOpacity>

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

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.overlay}>
          <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successMessage}>Deposit Successful</Text>

            <TouchableOpacity
              onPress={() => setShowSuccess(false)}
              style={styles.exitButton}
            >
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
