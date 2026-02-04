// BuyDataSuccessScreen.jsx - COMPLIANT VERSION
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const BuyDataSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get data from route params
  const { phone, network, plan, price } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        
        <Text style={styles.successTitle}>Data Purchase Successful!</Text>
        
        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone Number:</Text>
            <Text style={styles.detailValue}>{phone || "N/A"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network:</Text>
            <Text style={styles.detailValue}>{network || "N/A"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Data Plan:</Text>
            <Text style={styles.detailValue}>{plan || "N/A"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount Paid:</Text>
            <Text style={[styles.detailValue, styles.amountText]}>
              ₦{(price || 0).toLocaleString()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.deliveryNote}>
          ✅ Your data bundle will be delivered within 2-5 minutes.
        </Text>
        
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate("(tabs)/homeScreen")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.buyAgainButton}
          onPress={() => navigation.navigate("screens/BuyDataScreen")}
        >
          <Text style={styles.buyAgainButtonText}>Buy Another Bundle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginTop: 15,
    marginBottom: 25,
    textAlign: "center",
  },
  detailsBox: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  amountText: {
    color: "#FF7A00",
    fontSize: 16,
  },
  deliveryNote: {
    fontSize: 14,
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: "#FF7A00",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buyAgainButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  buyAgainButtonText: {
    color: "#FF7A00",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default BuyDataSuccessScreen;