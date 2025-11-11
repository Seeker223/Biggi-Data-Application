import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const SelectPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { network } = route.params || {}; // { id, name, logo }

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const dataPlans = [
    { id: "1", name: "1 GB", price: "₦600", validity: "30 Days" },
    { id: "2", name: "2 GB", price: "₦1,100", validity: "30 Days" },
    { id: "3", name: "5 GB", price: "₦2,600", validity: "30 Days" },
    { id: "4", name: "10 GB", price: "₦5,000", validity: "30 Days" },
    { id: "5", name: "15 GB", price: "₦7,000", validity: "30 Days" },
  ];

  const handleBuyNow = () => {
    if (!selectedPlan || !phoneNumber) return;
    setSuccessModalVisible(true);
  };

  const renderPlanCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.planCard,
        selectedPlan?.id === item.id && styles.selectedCard,
      ]}
      onPress={() => setSelectedPlan(item)}
      activeOpacity={0.8}
    >
      <View style={styles.planInfo}>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planValidity}>{item.validity}</Text>
      </View>
      <Text style={styles.planPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Data Plan</Text>
      </View>

      {/* Network Info */}
      <View style={styles.networkCard}>
        <Image source={network?.logo} style={styles.networkLogo} />
        <Text style={styles.networkName}>{network?.name}</Text>
      </View>

      {/* Plans List */}
      <FlatList
        data={dataPlans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Phone Input */}
      <View style={styles.inputSection}>
        <TextInput
          placeholder="Enter Phone Number"
          placeholderTextColor="#888"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
        />
      </View>

      {/* Buy Button */}
      <TouchableOpacity
        style={[
          styles.buyButton,
          (!selectedPlan || !phoneNumber) && { opacity: 0.6 },
        ]}
        onPress={handleBuyNow}
        activeOpacity={0.8}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>

      {/* ✅ Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.modalTitle}>Purchase Successful!</Text>
            <Text style={styles.modalText}>
              You have successfully purchased {selectedPlan?.name} for{" "}
              {phoneNumber}.
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
               onPress={() => navigation.navigate('screens/BuyDataSuccessScreen')}
            >
              <Text style={styles.closeText}>continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SelectPlanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6fa" },

  header: {
    backgroundColor: "#1E1E1E",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
  },

  networkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  networkLogo: { width: 50, height: 50, resizeMode: "contain" },
  networkName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
    color: "#333",
  },

  listContainer: { paddingHorizontal: 20 },
  planCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#FF7A00",
    shadowOpacity: 0.25,
    elevation: 5,
  },
  planInfo: {},
  planName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  planValidity: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  planPrice: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#FF7A00",
  },

  inputSection: { paddingHorizontal: 20, marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#333",
  },

  buyButton: {
    backgroundColor: "#FF7A00",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: width * 0.85,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
    marginVertical: 10,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FF7A00",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
});
