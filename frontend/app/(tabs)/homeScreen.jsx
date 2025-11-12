import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useRouter } from "expo-router"; // ✅ for navigation
import { useNavigation } from "@react-navigation/native";
import FloatingBottomNav from "../../components/FloatingBottomNav";


const { width } = Dimensions.get("window");

const HomeScreen = () => {
 const navigation = useNavigation();  // ✅ router hook

  const [mainBalance, setMainBalance] = useState(200);
  const [rewardBalance, setRewardBalance] = useState(50000);

  const goToDeposit = () => navigation.navigate("depositScreen");
  const goToWithdraw = () => navigation.navigate("withdrawScreen");
  const goToBundle = () => navigation.navigate("screens/BuyDataScreen");
  const goToRedeem = () => navigation.navigate("redeemScreen");
  const goToNotification = () => navigation.navigate("notificationScreen");
  const goToProfile = () => navigation.navigate("withdrawScreen");
  const goToDailyGame = () => navigation.navigate("dailyGameScreen");
  const goToWeeklyDraw = () => navigation.navigate("WeeklyDrawScreen");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo} >
            <Image
              source={{
                uri: "https://i.pravatar.cc/150?img=32",
              }
            }
              style={styles.avatar}
              
            />
            <View>
              <MotiText
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 600 }}
                style={styles.welcomeText}
              >
                Hi, User
              </MotiText>
              <Text style={styles.subText}  onPress={goToProfile}>Welcome back</Text>
            </View>
          </View>

          {/* Animated Notification */}
          <TouchableOpacity style={styles.bellBtn} onPress={goToNotification}>
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{
                type: "timing",
                loop: true,
                duration: 1000,
              }}
            >
              <Ionicons name="notifications" size={26} color="#FF7A00" />
            </MotiView>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
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
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={goToDeposit}
              >
                <Text style={styles.actionText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={goToWithdraw}
              >
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
            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={goToRedeem}
            >
              <Text style={styles.actionText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        <Text style={styles.infoText}>
          ✅ Buy Any Bundle → Unlock Daily & {"\n"} Weekly Games + Monthly Draw
        </Text>

        {/* White Curved Section */}
        <View style={styles.whiteWrapper}>
          <LinearGradient
            colors={["#ffffff", "#f7f7f7"]}
            style={styles.whiteSection}
          >
            {/* Bundle Card */}
            <MotiView
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.bundleCard}
            >
              <View style={styles.bundleLeft}>
                <MotiView
                  from={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    loop: true,
                    type: "timing",
                    duration: 1500,
                  }}
                >
                  <Ionicons name="wifi-outline" size={28} color="#FF7A00" />
                </MotiView>
                <Text style={styles.bundleTitle}>Buy Data Bundle Daily</Text>
                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={goToBundle}
                >
                  <Text style={styles.smallBtnText}>Buy Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dividerVertical} />

              <View style={styles.bundleRight}>
                <MotiView
                  from={{ rotate: "0deg" }}
                  animate={{ rotate: ["0deg", "15deg", "0deg", "-15deg", "0deg"] }}
                  transition={{
                    loop: true,
                    type: "timing",
                    duration: 2500,
                  }}
                >
                  <Ionicons name="ticket-outline" size={26} color="#000" />
                </MotiView>
                <Text style={styles.bundleDesc}>
                  Win Daily Tickets + One-Time Weekly Ticket To Participate In
                  Our Reward Games
                </Text>
              </View>
            </MotiView>

            {/* Game Cards */}
            <MotiView
              from={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1, 0.9] }}
              transition={{
                loop: true,
                type: "timing",
                duration: 3000,
              }}
              style={styles.gameCard}
            >
              <Ionicons name="game-controller" size={28} color="#fff" />
              <Text style={styles.gameTitle}>
                Daily Number Picker Reward Game
              </Text>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => router.push("/dailyGameScreen")}
              >
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1, 0.9] }}
              transition={{
                loop: true,
                type: "timing",
                duration: 3000,
                delay: 1000,
              }}
              style={styles.gameCard}
            >
              <Ionicons name="football-outline" size={28} color="#fff" />
              <Text style={styles.gameTitle}>
                Weekly Premier League Predict and Win Reward Game
              </Text>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => router.push("/weeklyGameScreen")}
              >
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Animated Floating Bottom Navigation */}
      <FloatingBottomNav/>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
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
    shadowColor: "#FF7A00",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
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
  infoText: { color: "#fff", fontSize: 13, marginTop: 14, textAlign: "center" },
  whiteWrapper: {
    marginTop: 20,
    width,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  whiteSection: { paddingTop: 25, paddingHorizontal: 16, flex: 1, minHeight: 500 },
  bundleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginTop: 8,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
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
  dividerVertical: { width: 1, backgroundColor: "#ddd", marginHorizontal: 10 },
  gameCard: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
  bottomNavWrapper: {
    position: "absolute",
    bottom: Platform.OS === "android" ? 25 : 35,
    width: "100%",
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 40,
    paddingVertical: 12,
    width: "88%",
    shadowColor: "#FF7A00",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 15,
  },
});
