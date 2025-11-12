import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const DailyLuckyDrawScreen = () => {
  const [timeLeft, setTimeLeft] = useState(6 * 60 * 60 + 45 * 60 + 3); // 6h45m03s
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: timeLeft * 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Section */}
        <LinearGradient
          colors={["#FF8C00", "#FF5C00"]}
          style={styles.headerSection}
        >
          <View style={styles.headerRow}>
            <Ionicons name="star" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Daily Lucky Draw</Text>
            <View style={styles.hotTag}>
              <Text style={styles.hotText}>Hot 🔥</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            {/* Prize Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>🎁 Prize to be won</Text>
              <Text style={styles.cardAmount}>₦2,000</Text>
              <Text style={styles.cardSub}>Two Thousand Naira</Text>
            </View>

            {/* Ticket Card */}
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>🎟 Ticket Prize</Text>
              <Text style={styles.ticketText}>
                Buy Any{"\n"}Biggi Data{"\n"}Bundle
              </Text>
            </View>
          </View>

          {/* Countdown Progress */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.countdownText}>
            Results will be out in the next - {formatTime(timeLeft)}
          </Text>
        </LinearGradient>

        {/* Weekly Section */}
        <View style={styles.weeklySection}>
          <View style={styles.weeklyRow}>
            <View style={styles.glassCardLight}>
              <Text style={styles.cardLabel}>🎁 Prize to be won</Text>
              <Text style={styles.cardAmountLight}>₦5,000</Text>
              <Text style={styles.cardSub}>Five Thousand Naira</Text>
            </View>

            <View style={styles.glassCardLight}>
              <Text style={styles.cardLabel}>🎟 Ticket Prize</Text>
              <Text style={styles.ticketTextDark}>
                Buy{"\n"}Biggi Data Bundle{"\n"}5 Times In A Week
              </Text>
            </View>
          </View>
        </View>

        {/* Results Section */}
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>🧾 Recent result</Text>

          {/* Daily Pick */}
          <View style={styles.dailyPickContainer}>
            <Text style={styles.pickLabel}>Daily Pick</Text>
            <View style={styles.pickNumbers}>
              {[30, 2, 41, 39, 11].map((num, i) => (
                <LinearGradient
                  key={i}
                  colors={["#FFB75E", "#FF7A00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.numberBox}
                >
                  <Text style={styles.numberText}>{num}</Text>
                </LinearGradient>
              ))}
            </View>
            <Text style={styles.tryAgainText}>
              Don’t quit, keep trying, you may be next winner
            </Text>
          </View>

          {/* Weekly PI */}
          <View style={styles.weeklyPrediction}>
            <Text style={styles.pickLabel}>Weekly PI Prediction</Text>
            <View style={styles.progressContainerLight}>
              <View style={[styles.progressBarLight, { width: "60%" }]} />
            </View>
            <Text style={styles.weeklyText}>
              Results will be out by Sunday - 07:30 PM
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DailyLuckyDrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerSection: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  hotTag: {
    backgroundColor: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  hotText: {
    color: "#FF5C00",
    fontWeight: "600",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  glassCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    backdropFilter: "blur(10px)",
  },
  cardLabel: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 8,
  },
  cardAmount: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  cardSub: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  ticketText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    marginTop: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  countdownText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
  },
  weeklySection: {
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  weeklyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  glassCardLight: {
    flex: 1,
    backgroundColor: "#fff",
    elevation: 2,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
  },
  cardAmountLight: {
    color: "#000",
    fontSize: 24,
    fontWeight: "800",
  },
  ticketTextDark: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  resultSection: {
    backgroundColor: "#fff",
    padding: 15,
    marginTop: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  dailyPickContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
  },
  pickLabel: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 10,
  },
  pickNumbers: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  numberBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  tryAgainText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  weeklyPrediction: {
    backgroundColor: "#f8f8f8",
    borderRadius: 16,
    padding: 12,
  },
  progressContainerLight: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBarLight: {
    height: 6,
    backgroundColor: "#FF7A00",
  },
  weeklyText: {
    textAlign: "center",
    color: "#555",
    fontSize: 12,
  },
});
