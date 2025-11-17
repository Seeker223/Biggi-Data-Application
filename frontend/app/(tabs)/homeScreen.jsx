import React, { useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText, AnimatePresence } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import FloatingBottomNav from "../../components/FloatingBottomNav";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, refreshUser, authLoading } = useContext(AuthContext);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");

  // ⏳ Refresh user on screen focus
  useFocusEffect(
    useCallback(() => {
      if (user) refreshUser();
    }, [user])
  );

  // Loader
  if (authLoading || !user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  const mainBalance = Number(user.mainBalance || 0);
  const rewardBalance = Number(user.rewardBalance || 0);

  // GAME ACCESS CHECKS
  const goToDailyGame = () => {
    if (user.tickets < 1) {
      setModalMessage("You need at least 1 ticket to play the Daily Game.");
      setModalVisible(true);
      return;
    }
    navigation.navigate("screens/DailyNumberDrawScreen");
  };

  const goToWeeklyGame = () => {
    if (user.tickets < 1) {
      setModalMessage("You need at least 1 ticket to join Weekly Top Buyers Game.");
      setModalVisible(true);
      return;
    }
    navigation.navigate("screens/GameWinnersScreen");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri: user?.photo
                  ? user.photo
                  : "https://i.pravatar.cc/150?img=32",
              }}
              style={styles.avatar}
            />

            <View>
              <MotiText
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 700 }}
                style={styles.welcomeText}
              >
                Hi, {user.username}
              </MotiText>

              <Text style={styles.subText}>Welcome back</Text>
            </View>
          </View>

          {/* 🔔 UPGRADED ANIMATED NOTIFICATION BELL */}
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate("notificationScreen")}>
            <MotiView
              from={{ scale: 1, opacity: 0.8 }}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                loop: true,
                type: "timing",
                duration: 1100,
              }}
            >
              <Ionicons name="notifications" size={28} color="#FF7A00" />
            </MotiView>
          </TouchableOpacity>
        </View>

        {/* WALLET CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800 }}
          style={styles.walletCard}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Main Balance</Text>
              <Text style={styles.balance}>₦{mainBalance.toLocaleString()}</Text>
            </View>

            <View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("depositScreen")}>
                <Text style={styles.actionText}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("withdrawScreen")}>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Reward Balance</Text>
              <Text style={styles.balance}>₦{rewardBalance.toLocaleString()}</Text>
            </View>

            <TouchableOpacity style={styles.redeemBtn} onPress={() => navigation.navigate("redeemScreen")}>
              <Text style={styles.actionText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        <Text style={styles.infoText}>
          🎉 Buy Any Bundle → Earn Tickets → Play Daily & Weekly Games
        </Text>

        {/* MAIN CONTENT */}
        <View style={styles.whiteWrapper}>
          <LinearGradient colors={["#ffffff", "#f5f5f5"]} style={styles.whiteSection}>

            {/* BUNDLE CARD */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.bundleCard}
            >
              <View style={styles.bundleLeft}>
                <MotiView
                  from={{ scale: 1 }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ loop: true, type: "timing", duration: 1500 }}
                >
                  <Ionicons name="wifi-outline" size={32} color="#FF7A00" />
                </MotiView>

                <Text style={styles.bundleTitle}>Buy Daily Data Bundle</Text>

                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() => navigation.navigate("screens/BuyDataScreen")}
                >
                  <Text style={styles.smallBtnText}>Buy Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerVertical} />

              {/* 🎟 Upgraded Ticket Animation + Counter */}
              <View style={styles.bundleRight}>
                <MotiView
                  from={{ rotate: "0deg" }}
                  animate={{
                    rotate: ["0deg", "10deg", "-10deg", "0deg"],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    loop: true,
                    type: "spring",
                    duration: 2000,
                  }}
                >
                  <Ionicons name="ticket-outline" size={30} color="#000" />
                </MotiView>

                <Text style={styles.ticketCount}>🎟 Tickets: {user.tickets}</Text>

                <Text style={styles.bundleDesc}>
                  Win Daily Tickets + Weekly Draw Entry!
                </Text>
              </View>
            </MotiView>

            {/* DAILY GAME (UPGRADED PULSE) */}
            <MotiView
              from={{ scale: 0.95 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ loop: true, type: "timing", duration: 2300 }}
              style={styles.gameCard}
            >
              <Ionicons name="game-controller" size={30} color="#fff" />
              <Text style={styles.gameTitle}>Daily Number Picker</Text>

              <TouchableOpacity style={styles.playBtn} onPress={goToDailyGame}>
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>

            {/* WEEKLY GAME (UPGRADED PULSE) */}
            <MotiView
              from={{ scale: 0.95 }}
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ loop: true, type: "timing", duration: 2300 }}
              style={styles.gameCard}
            >
              <Ionicons name="football-outline" size={30} color="#fff" />
              <Text style={styles.gameTitle}>Weekly Top Buyers Game</Text>

              <TouchableOpacity style={styles.playBtn} onPress={goToWeeklyGame}>
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>
          </LinearGradient>
        </View>
      </ScrollView>

      <FloatingBottomNav />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalWrapper}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMessage}</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;

/* ========================= STYLES (unchanged except few additions) ========================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loaderText: { color: "#fff", marginTop: 10 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  welcomeText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  subText: { color: "#bbb", fontSize: 14 },

  bellBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 50,
    elevation: 8,
  },

  walletCard: {
    backgroundColor: "#FFA500",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { color: "#222", fontWeight: "600" },
  balance: { fontSize: 26, fontWeight: "800", color: "#000" },
  actionBtn: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 4,
  },
  actionText: { color: "#fff", fontWeight: "600" },
  redeemBtn: {
    backgroundColor: "#444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  divider: { height: 1, backgroundColor: "#00000030", marginVertical: 10 },

  infoText: {
    color: "#fff",
    fontSize: 13,
    marginTop: 14,
    textAlign: "center",
  },

  whiteWrapper: {
    marginTop: 20,
    width,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  whiteSection: {
    paddingTop: 25,
    paddingHorizontal: 16,
  },

  bundleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    flexDirection: "row",
    elevation: 10,
  },
  bundleLeft: { flex: 1, alignItems: "center" },
  bundleRight: { flex: 1.3 },
  bundleTitle: { fontWeight: "700", marginVertical: 6, fontSize: 15 },
  bundleDesc: { fontSize: 13, color: "#333", marginTop: 5 },

  dividerVertical: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },

  ticketCount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  gameCard: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 18,
  },
  gameTitle: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 8,
  },
  playBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  playText: { color: "#fff", fontWeight: "700" },

  modalWrapper: {
    flex: 1,
    backgroundColor: "#00000090",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "75%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  modalBtn: {
    backgroundColor: "#FF7A00",
    padding: 10,
    borderRadius: 10,
  },
  modalBtnText: { color: "#fff", fontWeight: "700", textAlign: "center" },
});
