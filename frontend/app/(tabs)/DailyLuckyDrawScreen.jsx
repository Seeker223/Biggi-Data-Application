import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const DailyLuckyDrawScreen = () => {
  const [countdown, setCountdown] = useState("06:45:03");
  const [isDailyWinner, setIsDailyWinner] = useState(false);
  const [isWeeklyWinner, setIsWeeklyWinner] = useState(false);

  useEffect(() => {
    // Simulated countdown logic
    const timer = setInterval(() => {
      setCountdown((prev) => prev); // static display for now
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== HEADER ===== */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <FontAwesome5 name="star" size={18} color="#fff" />
            <Text style={styles.headerTitle}>Daily Lucky Draw</Text>
            <View style={styles.hotBadge}>
              <Text style={styles.hotText}>Hot 🔥</Text>
            </View>
          </View>

          {/* ===== PRIZE INFO ===== */}
          <View style={styles.prizeRow}>
            <View style={styles.prizeBox}>
              <Text style={styles.prizeLabel}>🎁 Prize to be won</Text>
              <Text style={styles.prizeAmount}>₦2,000</Text>
              <Text style={styles.prizeSub}>Two Thousand Naira</Text>
            </View>

            <View style={styles.prizeBox}>
              <Text style={styles.prizeLabel}>🎫 Ticket Prize</Text>
              <Text style={styles.ticketInfo}>Buy Any{"\n"}Biggi Data Bundle</Text>
            </View>
          </View>

          <View style={styles.timerBar}>
            <Text style={styles.timerText}>
              Results will be out in the next - {countdown}
            </Text>
          </View>
        </View>

        {/* ===== WEEKLY GAME SECTION ===== */}
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyTitle}>Weekly Premier League Prediction Game</Text>
          <View style={styles.prizeRow}>
            <View style={styles.prizeBoxLight}>
              <Text style={styles.prizeLabel}>🎁 Prize to be won</Text>
              <Text style={styles.prizeAmountLight}>₦5,000</Text>
              <Text style={styles.prizeSub}>Five Thousand Naira</Text>
            </View>

            <View style={styles.prizeBoxLight}>
              <Text style={styles.prizeLabel}>🎫 Ticket Prize</Text>
              <Text style={styles.ticketInfoDark}>
                Buy Biggi Data Bundle{"\n"}5 Times In A Week
              </Text>
            </View>
          </View>
        </View>

        {/* ===== RECENT RESULTS ===== */}
        <View style={styles.resultCard}>
          <Text style={styles.resultHeader}>
            <FontAwesome5 name="history" size={16} /> Recent Result
          </Text>

          {/* Daily Pick */}
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Daily Pick</Text>
            <View style={styles.numbersRow}>
              {[30, 2, 41, 39, 11].map((num) => (
                <View key={num} style={styles.numberBox}>
                  <Text style={styles.numberText}>{num}</Text>
                </View>
              ))}
            </View>
            {isDailyWinner ? (
              <TouchableOpacity style={styles.claimBtnGreen}>
                <Text style={styles.claimText}>Claim</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noteText}>
                Don’t quit, keep trying, you may be next winner
              </Text>
            )}
          </View>

          {/* Weekly Prediction */}
          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>Weekly PL Prediction</Text>
            {isWeeklyWinner ? (
              <TouchableOpacity style={styles.claimBtnGreen}>
                <Text style={styles.claimText}>Claim here</Text>
              </TouchableOpacity>
            ) : (
              <>
                <View style={styles.progressBar} />
                <Text style={styles.noteText}>
                  Results will be out by Sunday - 07:30 PM
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation (mock) */}
      <View style={styles.bottomNav}>
        <Ionicons name="home" size={22} color="#fff" style={styles.activeIcon} />
        <Ionicons name="ticket-outline" size={22} color="#000" />
      </View>
    </View>
  );
};

export default DailyLuckyDrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerCard: {
    backgroundColor: "#F6851F",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#fff",
    marginLeft: 10,
    flex: 1,
  },
  hotBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  hotText: {
    color: "#F6851F",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  prizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  prizeBox: {
    flex: 1,
    backgroundColor: "#D87C26",
    borderRadius: 12,
    padding: 15,
    margin: 5,
  },
  prizeBoxLight: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    padding: 15,
    margin: 5,
  },
  prizeLabel: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 12,
  },
  prizeAmount: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#fff",
  },
  prizeAmountLight: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#555",
  },
  prizeSub: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
    fontSize: 11,
  },
  ticketInfo: {
    fontFamily: "Poppins-Bold",
    color: "#fff",
    fontSize: 16,
  },
  ticketInfoDark: {
    fontFamily: "Poppins-Bold",
    color: "#555",
    fontSize: 16,
  },
  timerBar: {
    marginTop: 10,
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 8,
  },
  timerText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  weeklyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 15,
    padding: 10,
    elevation: 2,
  },
  weeklyTitle: {
    fontFamily: "Poppins-Bold",
    color: "#000",
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 15,
    padding: 15,
  },
  resultHeader: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    marginBottom: 8,
  },
  resultSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    color: "#000",
    marginBottom: 5,
  },
  numbersRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  numberBox: {
    backgroundColor: "#F6851F",
    padding: 8,
    borderRadius: 5,
    margin: 4,
  },
  numberText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  claimBtnGreen: {
    backgroundColor: "#6FCF97",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  claimText: {
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  noteText: {
    fontFamily: "Poppins-Regular",
    color: "#777",
    textAlign: "center",
    fontSize: 12,
  },
  progressBar: {
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginVertical: 5,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  activeIcon: {
    backgroundColor: "#F6851F",
    padding: 8,
    borderRadius: 20,
  },
});
