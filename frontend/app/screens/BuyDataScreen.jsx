import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Modal, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  ScrollView,
  Animated 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const BuyDataScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshUser } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState(null);
  const [networkCode, setNetworkCode] = useState(null);
  const [plan, setPlan] = useState(null);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const shakeAnim = new Animated.Value(0);

  useEffect(() => {
    if (route.params?.selectedNetwork) setNetwork(route.params.selectedNetwork);
    if (route.params?.networkCode) setNetworkCode(route.params.networkCode);
    if (route.params?.selectedPlan) {
      const p = route.params.selectedPlan;
      setPlan(p);
      setPrice(p.amount || p.price || 0);
    }
  }, [route.params]);

  const validate = () => {
    if (!phone) return "Enter phone number";
    if (phone.length !== 11) return "Phone number must be 11 digits";
    if (!networkCode) return "Select a network";
    if (!plan) return "Select a data plan";
    if (!price || price <= 0) return "Invalid plan price";
    return null;
  };

  const generateReference = () => `BD${Date.now()}`;

  const handlePay = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      shakeAnimation();
      return;
    }

    setErrorMsg("");
    setLoading(true);

    const backendPlanId = plan.plan_id || plan.code || plan.id || plan._id;

    const payload = { 
      network: networkCode, 
      mobile_no: phone, 
      amount: price, 
      plan_id: backendPlanId, 
      reference: generateReference() 
    };

    try {
      const res = await api.post("/data/buy", payload);

      if (res.data.success) {
        setSuccessModal(true);
        await refreshUser();
        setTimeout(() => {
          setSuccessModal(false);
          navigation.replace("screens/BuyDataSuccessScreen", { 
            phone, 
            network, 
            plan: plan.name || plan.plan_name, 
            price 
          });
        }, 1500);
      } else {
        setErrorMsg(res.data.msg || "Transaction failed");
        shakeAnimation();
      }
    } catch (error) {
      console.log("BUY DATA ERROR →", error?.response?.data || error);
      setErrorMsg(error?.response?.data?.msg || "Unable to process request");
      shakeAnimation();
    } finally {
      setLoading(false);
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,4})(\d{0,3})(\d{0,4})$/);
    if (!match) return text;
    return !match[2] ? match[1] : `${match[1]}-${match[2]}${match[3] ? `-${match[3]}` : ''}`;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    const digitsOnly = formatted.replace(/\D/g, '');
    setPhone(digitsOnly);
  };

  const getNetworkColor = () => {
    switch(networkCode?.toLowerCase()) {
      case 'mtn': return '#FFC107';
      case 'airtel': return '#E30613';
      case 'glo': return '#008000';
      case 'etisalat': return '#FF7A00';
      default: return '#FF7A00';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
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
          <Text style={styles.headerTitle}>Buy Data Bundle</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate("screens/SelectNetworkScreen")}
            style={styles.changeButton}
          >
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Selected Plan Info */}
          {plan && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
              style={styles.selectedPlanCard}
            >
              <View style={styles.planHeader}>
                <View style={[styles.networkBadge, { backgroundColor: getNetworkColor() }]}>
                  <Ionicons name="wifi" size={18} color="#fff" />
                  <Text style={styles.networkBadgeText}>{network}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => navigation.navigate("screens/SelectPlanScreen", { 
                    selectedNetwork: network, 
                    networkCode, 
                    categories: ["SME", "GIFTING", "CG"] 
                  })}
                >
                  <Ionicons name="create-outline" size={18} color="#FF7A00" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.planDetails}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>
                    {plan.name || plan.plan_name}
                  </Text>
                  <Text style={styles.planSize}>
                    {plan.size || plan.volume || "N/A"}
                  </Text>
                  <Text style={styles.planValidity}>
                    {plan.validity || plan.duration || "No validity specified"}
                  </Text>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Total</Text>
                  <Text style={styles.priceAmount}>₦{price.toLocaleString()}</Text>
                </View>
              </View>
            </MotiView>
          )}

          {/* Form Container */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.formContainer}
          >
            <Text style={styles.formTitle}>Enter Details</Text>
            
            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'phone' && styles.inputFocused
              ]}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0800 123 4567"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formatPhoneNumber(phone)}
                  onChangeText={handlePhoneChange}
                  maxLength={13}
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
                {phone.length > 0 && (
                  <TouchableOpacity onPress={() => setPhone("")}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.inputHint}>
                Enter the 11-digit phone number to receive data
              </Text>
            </View>

            {/* Network Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Network</Text>
              <TouchableOpacity 
                style={[
                  styles.networkSelector,
                  !network && styles.networkSelectorEmpty
                ]}
                onPress={() => navigation.navigate("screens/SelectNetworkScreen")}
              >
                {network ? (
                  <View style={styles.selectedNetwork}>
                    <View style={[styles.networkDot, { backgroundColor: getNetworkColor() }]} />
                    <Text style={styles.networkText}>{network}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select Network</Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Plan Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data Plan</Text>
              <TouchableOpacity 
                style={[
                  styles.planSelector,
                  !plan && styles.planSelectorEmpty
                ]}
                onPress={() => {
                  if (!network) {
                    setErrorMsg("Please select a network first");
                    shakeAnimation();
                    return;
                  }
                  navigation.navigate("screens/SelectPlanScreen", { 
                    selectedNetwork: network, 
                    networkCode, 
                    categories: ["SME", "GIFTING", "CG"] 
                  });
                }}
              >
                {plan ? (
                  <View style={styles.selectedPlan}>
                    <Ionicons name="wifi-outline" size={20} color="#FF7A00" />
                    <View style={styles.planTextContainer}>
                      <Text style={styles.planText}>
                        {plan.name || plan.plan_name}
                      </Text>
                      <Text style={styles.planSubtext}>
                        {plan.size || plan.volume || ""} • {plan.validity || plan.duration || ""}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select Data Plan</Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  { transform: [{ translateX: shakeAnim }] }
                ]}
              >
                <Ionicons name="alert-circle" size={18} color="#FF3B30" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </Animated.View>
            )}

            {/* Order Summary */}
            {plan && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Plan</Text>
                  <Text style={styles.summaryValue}>{plan.name || plan.plan_name}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Network</Text>
                  <Text style={styles.summaryValue}>{network}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Phone</Text>
                  <Text style={styles.summaryValue}>{formatPhoneNumber(phone) || "Not set"}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>₦{price.toLocaleString()}</Text>
                </View>
              </View>
            )}

            {/* Pay Button */}
            <Animated.View 
              style={{ transform: [{ translateX: shakeAnim }] }}
            >
              <TouchableOpacity 
                style={[
                  styles.payButton,
                  loading && styles.payButtonLoading,
                  (!phone || !network || !plan) && styles.payButtonDisabled
                ]} 
                onPress={handlePay}
                disabled={loading || !phone || !network || !plan}
              >
                <LinearGradient
                  colors={["#FF7A00", "#FF5C00"]}
                  style={styles.payButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="lock-closed" size={20} color="#fff" />
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#666" />
              <Text style={styles.infoText}>
                • Instant delivery within 2-5 minutes{"\n"}
                • 24/7 customer support available{"\n"}
                • Secure payment processing
              </Text>
            </View>
          </MotiView>
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
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successText}>
                Your data bundle purchase is being processed.
              </Text>
              <View style={styles.loadingBar}>
                <View style={styles.loadingProgress} />
              </View>
            </MotiView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BuyDataScreen;

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
    fontSize: 20,
    fontWeight: "800",
  },
  changeButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  selectedPlanCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  networkBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A0010",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  editText: {
    color: "#FF7A00",
    fontSize: 12,
    fontWeight: "600",
  },
  planDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  planSize: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  planValidity: {
    fontSize: 12,
    color: "#999",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FF7A00",
  },
  formContainer: {
    marginTop: 25,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  inputFocused: {
    borderColor: "#FF7A00",
    backgroundColor: "#fff",
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
  networkSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  networkSelectorEmpty: {
    borderStyle: "dashed",
  },
  selectedNetwork: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  networkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  networkText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  planSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  planSelectorEmpty: {
    borderStyle: "dashed",
  },
  selectedPlan: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  planTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  planText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  planSubtext: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: {
    flex: 1,
    color: "#D32F2F",
    fontSize: 14,
    marginLeft: 10,
  },
  summaryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF7A00",
  },
  payButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  payButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  payButtonLoading: {
    opacity: 0.8,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1e7ff",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    marginLeft: 10,
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
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
  },
  loadingBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "#4CAF50",
    width: "100%",
  },
});