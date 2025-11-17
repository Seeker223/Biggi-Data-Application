import React, { useContext, useCallback, useState } from "react";
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
import { MotiView, MotiText } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import FloatingBottomNav from "../../components/FloatingBottomNav";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, refreshUser, authLoading } = useContext(AuthContext);

  const [ticketModalVisible, setTicketModalVisible] = useState(false);

  // Auto-refresh user
  useFocusEffect(
    useCallback(() => {
      if (user) refreshUser();
    }, [user])
  );

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // WALLET VALUES
  const mainBalance = Number(user.mainBalance || 0);
  const rewardBalance = Number(user.rewardBalance || 0);
  const tickets = Number(user.tickets || 0);

  // NAVIGATION
  const goToDeposit = () => navigation.navigate("depositScreen");
  const goToWithdraw = () => navigation.navigate("withdrawScreen");
  const goToBundle = () => navigation.navigate("screens/BuyDataScreen");
  const goToRedeem = () => navigation.navigate("redeemScreen");
  const goToNotification = () => navigation.navigate("notificationScreen");

  // GAME VALIDATIONS
  const handleDailyGame = () => {
    if (tickets <= 0) return setTicketModalVisible(true);
    navigation.navigate("screens/DailyNumberDrawScreen");
  };

  const handleWeeklyGame = () => {
    if (tickets <= 0) return setTicketModalVisible(true);
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
                transition={{ type: "timing", duration: 600 }}
                style={styles.welcomeText}
              >
                Hi, {user.username}
              </MotiText>
              <Text style={styles.subText}>Welcome back</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bellBtn} onPress={goToNotification}>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ loop: true, type: "timing", duration: 1000 }}
            >
              <Ionicons name="notifications" size={26} color="#FF7A00" />
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
              <Text style={styles.balance}>
                ₦{mainBalance.toLocaleString()}
              </Text>
            </View>

            <View>
              <TouchableOpacity style={styles.actionBtn} onPress={goToDeposit}>
                <Text style={styles.actionText}>Deposit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={goToWithdraw}>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Reward Balance</Text>
              <Text style={styles.balance}>
                ₦{rewardBalance.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity style={styles.redeemBtn} onPress={goToRedeem}>
              <Text style={styles.actionText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* TICKET TEXT */}
        <Text style={styles.ticketText}>
          🎫 Available Tickets:{" "}
          <Text style={{ color: "#FF7A00", fontWeight: "bold" }}>
            {tickets}
          </Text>
        </Text>

        <Text style={styles.infoText}>
          ✅ Buy Any Bundle → Unlock Daily & Weekly Games + Monthly Draw
        </Text>

        {/* WHITE SECTION */}
        <View style={styles.whiteWrapper}>
          <LinearGradient
            colors={["#ffffff", "#f7f7f7"]}
            style={styles.whiteSection}
          >
            {/* ⭐ BUNDLE CARD */}
            <MotiView
              from={{ opacity: 0, translateY: 25, scale: 0.95 }}
              animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
              }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.bundleCard}
            >
              <MotiView
                from={{ shadowOpacity: 0.1 }}
                animate={{ shadowOpacity: [0.1, 0.4, 0.1] }}
                transition={{ loop: true, duration: 2000 }}
                style={styles.bundleGlowOverlay}
              />

              <View style={styles.bundleLeft}>
                <Ionicons name="wifi-outline" size={28} color="#FF7A00" />
                <Text style={styles.bundleTitle}>Buy Data Bundle Daily</Text>

                <TouchableOpacity style={styles.smallBtn} onPress={goToBundle}>
                  <Text style={styles.smallBtnText}>Buy Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerVertical} />

              {/* RIGHT SIDE WITH BADGE */}
              <View style={styles.bundleRight}>
                <View style={styles.ticketIconContainer}>
                  {/* glowing pulse */}
                  <MotiView
                    from={{ opacity: 0.4, scale: 1 }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ loop: true, duration: 1800 }}
                    style={styles.ticketGlow}
                  />

                  <Ionicons name="ticket-outline" size={26} color="#000" />

                  <MotiView
                    style={styles.ticketBadge}
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Text style={styles.ticketBadgeText}>{tickets}</Text>
                  </MotiView>
                </View>

                <Text style={styles.bundleDesc}>
                  Win Daily Tickets + One-Time Weekly Ticket!
                </Text>
              </View>
            </MotiView>

            {/* ⭐ DAILY GAME – PULSATING RESTORED */}
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ loop: true, duration: 1800 }}
              style={styles.gameCard}
            >
              <Ionicons name="game-controller" size={28} color="#fff" />
              <Text style={styles.gameTitle}>Daily Number Picker Game</Text>

              <TouchableOpacity
                style={[
                  styles.playBtn,
                  tickets <= 0 ? styles.disabledBtn : null,
                ]}
                onPress={handleDailyGame}
              >
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>

            {/* ⭐ WEEKLY GAME – PULSATING RESTORED */}
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ loop: true, duration: 1800 }}
              style={styles.gameCard}
            >
              <Ionicons name="football-outline" size={28} color="#fff" />
              <Text style={styles.gameTitle}>Weekly Top Buyers Game</Text>

              <TouchableOpacity
                style={[
                  styles.playBtn,
                  tickets <= 0 ? styles.disabledBtn : null,
                ]}
                onPress={handleWeeklyGame}
              >
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* NO TICKET MODAL */}
      <Modal transparent visible={ticketModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={42} color="#FF7A00" />
            <Text style={styles.modalTitle}>No Tickets Available</Text>
            <Text style={styles.modalMsg}>
              You need at least 1 ticket to play this game.
            </Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setTicketModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingBottomNav />
    </View>
  );
};

export default HomeScreen;

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ⭐ TICKET GLOW */
  ticketGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF7A00",
    opacity: 0.2,
  },

  ticketIconContainer: {
    position: "relative",
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  ticketBadge: {
    position: "absolute",
    top: -10,
    right: -12,
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  ticketBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  /* ⭐ GLOW FOR BUNDLE CARD */
  bundleGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: "#FF7A00",
    shadowRadius: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    zIndex: -1,
  },

  ticketText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },

  disabledBtn: {
    backgroundColor: "#999",
    opacity: 0.6,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
  },

  modalTitle: { fontWeight: "bold", fontSize: 18, marginTop: 10 },
  modalMsg: { textAlign: "center", marginVertical: 12, color: "#444" },

  modalBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginTop: 10,
  },

  modalBtnText: { color: "#fff", fontWeight: "bold" },

  /* HEADER */
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
    borderRadius: 30,
    elevation: 8,
  },

  /* WALLET */
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

  balance: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
  },

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

  /* WHITE SECTION */
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
    minHeight: 500,
  },

  bundleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 10,
    position: "relative",
  },

  bundleLeft: { flex: 1, alignItems: "center" },

  bundleRight: { flex: 1.3 },

  bundleTitle: { fontWeight: "700", marginVertical: 6, fontSize: 15 },

  bundleDesc: { fontSize: 13, color: "#333", lineHeight: 18 },

  smallBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },

  smallBtnText: { fontSize: 12, color: "#fff" },

  dividerVertical: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },

  /* GAME CARDS (pulsating) */
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
});
