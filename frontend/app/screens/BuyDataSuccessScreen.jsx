import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BuyDataSuccessScreen = () => {
  const [showTicketModal, setShowTicketModal] = useState(true);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const navigation = useNavigation();

  const handleClaimTicket = () => {
    setShowTicketModal(false);
    setShowClaimModal(true);
  };

  const handlePlayGame = () => {
    setShowClaimModal(false);
    navigation.navigate("screens/DailyNumberDrawScreen"); // navigate to your game dashboard
  };

  return (
    <View style={styles.container}>
      {/* ✅ Ticket Reward Modal */}
      <Modal visible={showTicketModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTicketModal(false)}
            >
              <Ionicons name="close-circle" size={28} color="#FF4C4C" />
            </TouchableOpacity>

            <View style={styles.ticketCard}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={40}
                color="#FF8C00"
                style={styles.ticketIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketTitle}>Congratulations!!!</Text>
                <Text style={styles.ticketSubtitle}>
                  One ticket has been added to your account {"\n"}as a reward for
                  purchasing a data bundle
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaimTicket}
            >
              <Text style={styles.claimButtonText}>Claim here</Text>
            </TouchableOpacity>

            <Text style={styles.noteText}>
              Note: use ticket to play the daily game
            </Text>
          </View>
        </View>
      </Modal>

      {/* ✅ Claim Success Modal */}
      <Modal visible={showClaimModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={60}
              color="green"
            />
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successMessage}>
              Ticket Claim Successful
            </Text>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayGame}
            >
              <Text style={styles.playButtonText}>Play game now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => navigation.navigate("(tabs)/homeScreen")}
            >
              <Text style={styles.exitButtonText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BuyDataSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 25,
  },
  ticketIcon: {
    marginRight: 15,
  },
  ticketTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#111",
  },
  ticketSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  claimButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  noteText: {
    marginTop: 10,
    color: "#FF8C00",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "center",
  },
  successTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#000",
    marginTop: 10,
  },
  successMessage: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#555",
    marginVertical: 10,
  },
  playButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 15,
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  exitButton: {
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  exitButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});
