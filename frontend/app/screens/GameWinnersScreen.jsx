import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const winners = Array(10).fill({ name: "Jason Deredz", id: "123456" });

export default function GameWinnersScreen() {

  const navigation = useNavigation();
    
  const [hasReward, setHasReward] = useState(true);
  const [successVisible, setSuccessVisible] = useState(false);

  const handleClaim = () => {
    setSuccessVisible(true);
    setHasReward(false);
  };

  return (
    <LinearGradient colors={["#2B006A", "#A000A6"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Card Container */}
      <View style={styles.card}>
        <LinearGradient
          colors={["#FFA500", "#FFD700"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleContainer}
        >
          <Text style={styles.title}>Winners</Text>
        </LinearGradient>

        <FlatList
          data={winners}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.separator}> - </Text>
              <Text style={styles.id}>ID: {item.id}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity
          style={hasReward ? styles.claimButton : styles.inactiveButton}
          onPress={hasReward ? handleClaim : null}
        >
          <Text
            style={hasReward ? styles.claimText : styles.inactiveText}
          >
            {hasReward ? "Claim now" : "Stay active you are next"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={successVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successMsg}>
              Claimed Rewards added to Reward account
            </Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setSuccessVisible(false)}
            >
              <Text style={styles.okText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 45,
    marginLeft: 20,
  },
  card: {
    backgroundColor: "#fff",
    margin: 25,
    borderRadius: 30,
    padding: 20,
    flex: 1,
  },
  titleContainer: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  name: { fontSize: 15, color: "#000" },
  separator: { color: "#000" },
  id: { fontSize: 15, color: "#000" },
  claimButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  claimText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  inactiveButton: {
    backgroundColor: "#eee",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  inactiveText: {
    color: "#444",
    fontWeight: "700",
    fontSize: 15,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 280,
    padding: 25,
    alignItems: "center",
  },
  checkCircle: {
    backgroundColor: "#32CD32",
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  successTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  successMsg: {
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },
  okButton: {
    backgroundColor: "#FF7A00",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  okText: { color: "#fff", fontWeight: "700" },
});
