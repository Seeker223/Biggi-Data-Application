// screens/BuyDataScreen
import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

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
    if (err) return setErrorMsg(err);

    setErrorMsg("");
    setLoading(true);

    const backendPlanId = plan.plan_id || plan.code || plan.id || plan._id; // ✅ backend code

    const payload = { network: networkCode, mobile_no: phone, amount: price, plan_id: backendPlanId, reference: generateReference() };

    console.log("Sending plan payload →", payload);

    try {
      const res = await api.post("/data/buy", payload);

      if (res.data.success) {
        setSuccessModal(true);
        await refreshUser();
        setTimeout(() => {
          setSuccessModal(false);
          navigation.replace("screens/BuyDataSuccessScreen", { phone, network, plan: plan.name || plan.plan_name, price });
        }, 1300);
      } else setErrorMsg(res.data.msg || "Transaction failed");
    } catch (error) {
      console.log("BUY DATA ERROR →", error?.response?.data || error);
      setErrorMsg(error?.response?.data?.msg || "Unable to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Data</Text>
        </View>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#777" keyboardType="number-pad" value={phone} maxLength={11} onChangeText={setPhone} />

          <TouchableOpacity style={styles.dropdown} onPress={() => navigation.navigate("screens/SelectNetworkScreen")}>
            <Text style={styles.dropdownText}>{network || "Select Network"}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              if (!network) return setErrorMsg("Select network first");
              navigation.navigate("screens/SelectPlanScreen", { selectedNetwork: network, networkCode, categories: ["SME", "GIFTING", "CG"] });
            }}
          >
            <Text style={styles.dropdownText}>{plan ? plan.name || plan.plan_name : "Select a Data Plan"}</Text>
            <Ionicons name="chevron-down" size={18} color="#000" />
          </TouchableOpacity>

          {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

          <TouchableOpacity style={[styles.payButton, loading && { opacity: 0.7 }]} disabled={loading} onPress={handlePay}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Pay Now</Text>}
          </TouchableOpacity>

          {price > 0 && <Text style={styles.priceLabel}>₦{price.toLocaleString()}</Text>}
        </View>

        <Modal transparent visible={successModal}>
          <View style={styles.modalWrapper}>
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={70} color="green" />
              <Text style={styles.successText}>Transaction Successful</Text>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BuyDataScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 10 },
  form: { marginTop: 30 },
  input: { backgroundColor: "#E5E5E5", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 15, fontSize: 14, marginBottom: 15 },
  dropdown: { backgroundColor: "#E5E5E5", borderRadius: 10, paddingVertical: 14, paddingHorizontal: 15, marginBottom: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dropdownText: { fontSize: 14, color: "#000" },
  payButton: { backgroundColor: "#FF7A00", borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 10 },
  payText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  priceLabel: { marginTop: 10, fontWeight: "600", fontSize: 15 },
  modalWrapper: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center" },
  successBox: { backgroundColor: "#fff", padding: 25, borderRadius: 20, alignItems: "center", width: 220 },
  successText: { fontSize: 18, fontWeight: "600", marginTop: 10, textAlign: "center" },
  errorMsg: { color: "red", marginBottom: 10 },
});
