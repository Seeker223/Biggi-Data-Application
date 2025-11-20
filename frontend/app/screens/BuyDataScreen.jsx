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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { buyData } from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const BuyDataScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshUser } = useContext(AuthContext);

  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState(null);
  const [plan, setPlan] = useState(null);
  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // RECEIVE NETWORK & PLAN
  useEffect(() => {
    if (route.params?.selectedNetwork) {
      setNetwork(route.params.selectedNetwork);
    }

    if (route.params?.selectedPlan) {
      setPlan(route.params.selectedPlan.name);
      setPrice(route.params.selectedPlan.price);
    }
  }, [route.params]);

  const validate = () => {
    if (!phone) return "Enter phone number";
    if (phone.length !== 11) return "Phone number must be 11 digits";
    if (!network) return "Select a network";
    if (!plan) return "Select a plan";
    if (!price || price <= 0) return "Invalid plan price";
    return null;
  };

  const generateReference = () => `BD${Date.now()}`;

  const handlePay = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setErrorMsg("");
    setLoading(true);

    const payload = {
      mobile_no: phone,
      plan_id: route.params.selectedPlan.id, // BACKEND REQUIRES THIS
      amount: price, // *** REQUIRED by backend ***
      reference: generateReference(),
    };

    const result = await buyData(payload);
    setLoading(false);

    if (result.success) {
      setSuccessModal(true);

      await refreshUser(); // refresh balance

      setTimeout(() => {
        setSuccessModal(false);

        navigation.replace("screens/BuyDataSuccessScreen", {
          phone,
          network,
          plan,
          price,
        });
      }, 1500);
    } else {
      setErrorMsg(result.msg || "Transaction failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        {/* PHONE INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#777"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.contactRow}>
          <Text style={styles.contactText}>Select from Contacts</Text>
          <Ionicons name="person-add-outline" size={18} color="#000" />
        </TouchableOpacity>

        {/* NETWORK */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => navigation.navigate("screens/SelectNetworkScreen")}
        >
          <Text style={styles.dropdownText}>{network || "Network"}</Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        {/* PLAN */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            if (!network) {
              setErrorMsg("Please select a network first");
            } else {
              navigation.navigate("screens/SelectPlanScreen", {
                selectedNetwork: network,
              });
            }
          }}
        >
          <Text style={styles.dropdownText}>
            {plan || "Select Data Plan"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        {/* ERROR */}
        {errorMsg ? (
          <Text style={{ color: "red", marginBottom: 10 }}>{errorMsg}</Text>
        ) : null}

        {/* PAY */}
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>

        {price > 0 && (
          <Text style={styles.price}>₦{price.toLocaleString()}</Text>
        )}
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={22} color="#FF7A00" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="document-text-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* LOADING MODAL */}
      <Modal transparent visible={loading}>
        <View style={styles.modalWrapper}>
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal transparent visible={successModal}>
        <View style={styles.modalWrapper}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={70} color="green" />
            <Text style={{ fontSize: 18, fontFamily: "Poppins-SemiBold" }}>
              Successful
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BuyDataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  headerRow: {
    marginTop: 10,
  },
  form: {
    marginTop: 30,
  },
  inputRow: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  contactText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  dropdown: {
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#000",
  },
  payButton: {
    backgroundColor: "#FF7A00",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  payText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },
  price: {
    marginTop: 10,
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F5F3F3",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    width: 180,
  },
});
