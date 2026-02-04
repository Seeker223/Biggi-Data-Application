import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const { width } = Dimensions.get("window");

const RedeemScreen = () => {
  const navigation = useNavigation();
  const { user, refreshUser } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState("airtime"); // 'airtime', 'cash', 'data'
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    accountName: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const rewardBalance = Number(user?.rewardBalance || 0);

  // Airtime options
  const airtimeAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  // Cash withdrawal options
  const cashAmounts = [500, 1000, 2000, 5000, 10000, 20000];
  
  // Data bundle options
  const dataAmounts = [
    { amount: 500, data: "500MB", network: "All Networks" },
    { amount: 1000, data: "1GB", network: "All Networks" },
    { amount: 2000, data: "2GB", network: "All Networks" },
    { amount: 5000, data: "5GB", network: "All Networks" },
  ];

  const getAmountOptions = () => {
    switch (activeTab) {
      case "airtime":
        return airtimeAmounts;
      case "cash":
        return cashAmounts;
      case "data":
        return dataAmounts;
      default:
        return [];
    }
  };

  const validateInputs = () => {
    if (rewardBalance < (selectedAmount || parseInt(customAmount) || 0)) {
      return "Insufficient reward balance";
    }
    
    if (activeTab === "airtime" || activeTab === "data") {
      if (!phoneNumber || phoneNumber.length !== 11) {
        return "Please enter a valid 11-digit phone number";
      }
    }
    
    if (activeTab === "cash") {
      if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 10) {
        return "Please enter a valid account number";
      }
      if (!bankDetails.accountName) {
        return "Please enter account name";
      }
      if (!bankDetails.bankName) {
        return "Please select a bank";
      }
    }
    
    return null;
  };

  const handleRedeem = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please select an amount");
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      Alert.alert("Validation Error", validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        type: activeTab,
        amount: amount,
        ...(activeTab === "airtime" || activeTab === "data" ? { phoneNumber } : {}),
        ...(activeTab === "cash" ? { ...bankDetails } : {}),
      };

      const response = await api.post("/redeem/process", payload);

      if (response.data.success) {
        setRedeemAmount(amount);
        setSuccessModal(true);
        await refreshUser();
        
        // Reset form
        setSelectedAmount(null);
        setPhoneNumber("");
        setBankDetails({
          accountNumber: "",
          accountName: "",
          bankName: "",
        });
        setCustomAmount("");
        setShowCustomInput(false);
      } else {
        Alert.alert("Error", response.data.msg || "Failed to process redemption");
      }
    } catch (error) {
      console.error("Redeem error:", error);
      Alert.alert("Error", "Failed to process redemption. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setShowCustomInput(false);
    setCustomAmount("");
  };

  const handleCustomAmount = () => {
    setShowCustomInput(true);
    setSelectedAmount(null);
  };

  const renderAmountOptions = () => {
    const amounts = getAmountOptions();
    
    if (activeTab === "data") {
      return (
        <View style={styles.dataGrid}>
          {amounts.map((item, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                style={[
                  styles.dataCard,
                  selectedAmount === item.amount && styles.selectedDataCard,
                ]}
                onPress={() => handleAmountSelect(item.amount)}
              >
                <LinearGradient
                  colors={
                    selectedAmount === item.amount 
                      ? ["#FF7A00", "#FF9A00"] 
                      : ["#f9f9f9", "#f0f0f0"]
                  }
                  style={styles.dataCardContent}
                >
                  <Text style={[
                    styles.dataAmount,
                    selectedAmount === item.amount && styles.selectedDataText
                  ]}>
                    ₦{item.amount.toLocaleString()}
                  </Text>
                  <Text style={[
                    styles.dataSize,
                    selectedAmount === item.amount && styles.selectedDataText
                  ]}>
                    {item.data}
                  </Text>
                  <Text style={[
                    styles.dataNetwork,
                    selectedAmount === item.amount && styles.selectedDataText
                  ]}>
                    {item.network}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.amountGrid}>
        {amounts.map((amount, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 100 }}
          >
            <TouchableOpacity
              style={[
                styles.amountOption,
                selectedAmount === amount && styles.selectedAmountOption,
              ]}
              onPress={() => handleAmountSelect(amount)}
            >
              <Text style={[
                styles.amountText,
                selectedAmount === amount && styles.selectedAmountText,
              ]}>
                ₦{amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </MotiView>
        ))}
        
        {/* Custom Amount Option */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: amounts.length * 100 }}
        >
          <TouchableOpacity
            style={[
              styles.amountOption,
              showCustomInput && styles.selectedAmountOption,
            ]}
            onPress={handleCustomAmount}
          >
            <Text style={[
              styles.amountText,
              showCustomInput && styles.selectedAmountText,
            ]}>
              Custom
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  };

  const renderCustomAmountInput = () => {
    if (!showCustomInput) return null;

    return (
      <MotiView
        from={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 60 }}
        style={styles.customAmountContainer}
      >
        <View style={styles.customAmountWrapper}>
          <Text style={styles.currencySymbol}>₦</Text>
          <TextInput
            style={styles.customAmountInput}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={setCustomAmount}
            maxLength={6}
          />
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setCustomAmount("");
              setShowCustomInput(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </MotiView>
    );
  };

  const renderForm = () => {
    if (activeTab === "airtime" || activeTab === "data") {
      return (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {activeTab === "airtime" ? "Phone Number" : "Recipient Number"}
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="0800 123 4567"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={11}
            />
          </View>
          <Text style={styles.inputHint}>
            Enter the 11-digit phone number to receive {activeTab}
          </Text>
        </View>
      );
    }

    if (activeTab === "cash") {
      return (
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0123456789"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={bankDetails.accountNumber}
                onChangeText={(text) => setBankDetails({...bankDetails, accountNumber: text})}
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#999"
                value={bankDetails.accountName}
                onChangeText={(text) => setBankDetails({...bankDetails, accountName: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank Name</Text>
            <TouchableOpacity style={styles.bankSelector}>
              <Ionicons name="business-outline" size={20} color="#666" style={styles.inputIcon} />
              <Text style={[
                styles.bankSelectorText,
                !bankDetails.bankName && { color: "#999" }
              ]}>
                {bankDetails.bankName || "Select Bank"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  const getTabColor = () => {
    switch (activeTab) {
      case "airtime": return "#FF7A00";
      case "cash": return "#28A745";
      case "data": return "#2196F3";
      default: return "#FF7A00";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#FF7A00", "#FF5C00"]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Redeem Rewards</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("screens/RewardHistoryScreen")}
          style={styles.historyButton}
        >
          <Ionicons name="time-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Ionicons name="gift" size={24} color="#FFD700" />
            <Text style={styles.balanceTitle}>Available Rewards</Text>
          </View>
          
          <Text style={styles.balanceAmount}>₦{rewardBalance.toLocaleString()}</Text>
          <Text style={styles.balanceSubtitle}>Total reward balance</Text>
          
          <View style={styles.balanceInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Instant processing</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>No hidden fees</Text>
            </View>
          </View>
        </MotiView>

        {/* Redeem Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Redeem As</Text>
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "airtime" && styles.activeTab,
                { borderColor: getTabColor() }
              ]}
              onPress={() => setActiveTab("airtime")}
            >
              <Ionicons 
                name="call" 
                size={20} 
                color={activeTab === "airtime" ? "#fff" : getTabColor()} 
              />
              <Text style={[
                styles.tabText,
                activeTab === "airtime" && styles.activeTabText
              ]}>
                Airtime
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "cash" && styles.activeTab,
                { borderColor: "#28A745" }
              ]}
              onPress={() => setActiveTab("cash")}
            >
              <Ionicons 
                name="cash" 
                size={20} 
                color={activeTab === "cash" ? "#fff" : "#28A745"} 
              />
              <Text style={[
                styles.tabText,
                activeTab === "cash" && styles.activeTabText
              ]}>
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "data" && styles.activeTab,
                { borderColor: "#2196F3" }
              ]}
              onPress={() => setActiveTab("data")}
            >
              <Ionicons 
                name="wifi" 
                size={20} 
                color={activeTab === "data" ? "#fff" : "#2196F3"} 
              />
              <Text style={[
                styles.tabText,
                activeTab === "data" && styles.activeTabText
              ]}>
                Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Selection */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          {renderAmountOptions()}
          {renderCustomAmountInput()}
        </View>

        {/* Form Inputs */}
        {renderForm()}

        {/* Redeem Button */}
        <TouchableOpacity 
          style={[
            styles.redeemButton,
            loading && styles.redeemButtonLoading,
            (!selectedAmount && !customAmount) && styles.redeemButtonDisabled
          ]} 
          onPress={handleRedeem}
          disabled={loading || (!selectedAmount && !customAmount)}
        >
          <LinearGradient
            colors={[getTabColor(), getTabColor() + "CC"]}
            style={styles.redeemButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="gift" size={20} color="#fff" />
                <Text style={styles.redeemButtonText}>
                  Redeem Now
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Minimum redemption amount: ₦100{"\n"}
              • Processing time: 5-15 minutes{"\n"}
              • Airtime/Data: All Nigerian networks{"\n"}
              • Cash withdrawals: Bank transfers only{"\n"}
              • Contact support for any issues
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal transparent visible={successModal} animationType="fade">
        <View style={styles.modalWrapper}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            style={styles.successBox}
          >
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Redemption Successful!</Text>
            <Text style={styles.successText}>
              ₦{redeemAmount.toLocaleString()} {activeTab} has been processed.
            </Text>
            <Text style={styles.successSubtext}>
              You will receive it within 15 minutes.
            </Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setSuccessModal(false);
                navigation.navigate("homeScreen");
              }}
            >
              <Text style={styles.okText}>Done</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.okButton, { backgroundColor: "#666", marginTop: 8 }]}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.okText}>Redeem More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RedeemScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  historyButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginLeft: 10,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FF7A00",
    marginBottom: 5,
  },
  balanceSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  optionsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
    paddingLeft: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: "#FF7A00",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  amountSection: {
    marginTop: 25,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  amountOption: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  selectedAmountOption: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#666",
  },
  selectedAmountText: {
    color: "#fff",
  },
  customAmountContainer: {
    marginTop: 10,
    overflow: "hidden",
  },
  customAmountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF7A00",
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 14,
  },
  clearButton: {
    padding: 4,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dataCard: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  selectedDataCard: {
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  dataCardContent: {
    padding: 16,
    alignItems: "center",
  },
  dataAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  dataSize: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 4,
  },
  dataNetwork: {
    fontSize: 11,
    color: "#999",
  },
  selectedDataText: {
    color: "#fff",
  },
  formSection: {
    marginTop: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 14,
  },
  inputHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    paddingLeft: 5,
  },
  bankSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  bankSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  redeemButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 30,
    marginBottom: 20,
  },
  redeemButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  redeemButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  redeemButtonLoading: {
    opacity: 0.8,
  },
  redeemButtonDisabled: {
    opacity: 0.5,
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#f0f7ff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1e7ff",
    marginTop: 10,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0066CC",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 30,
    width: width * 0.85,
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 10,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 15,
  },
  successSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 25,
  },
  okButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  okText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});