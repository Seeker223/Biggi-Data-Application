import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const BRAND_COLORS = {
  primary: "#FF7A00",
  primaryDark: "#E56A00",
  secondary: "#000000",
  background: "#FFFFFF",
  cardBg: "#F8F9FA",
  textPrimary: "#000000",
  textSecondary: "#666666",
  success: "#28A745",
  error: "#DC3545",
  warning: "#FFC107",
  info: "#17A2B8",
};

const DailyLuckyDrawScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'weekly'
  const [timeLeftDaily, setTimeLeftDaily] = useState(6 * 60 * 60 + 45 * 60 + 3);
  const [timeLeftWeekly, setTimeLeftWeekly] = useState(2 * 24 * 60 * 60 + 12 * 60 * 60); // 2 days 12 hours
  const [ticketsPurchased, setTicketsPurchased] = useState(3);
  const [weeklyPurchases, setWeeklyPurchases] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [winners, setWinners] = useState([
    { id: 1, name: "John D.", amount: "₦2,000", time: "Today, 7:30 PM" },
    { id: 2, name: "Sarah M.", amount: "₦1,500", time: "Yesterday" },
    { id: 3, name: "Alex K.", amount: "₦2,500", time: "2 days ago" },
  ]);
  
  const progressDaily = useRef(new Animated.Value(0)).current;
  const progressWeekly = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Daily countdown
    const dailyInterval = setInterval(() => {
      setTimeLeftDaily((prev) => (prev > 0 ? prev - 1 : 86400)); // Reset to 24h when done
    }, 1000);

    // Weekly countdown
    const weeklyInterval = setInterval(() => {
      setTimeLeftWeekly((prev) => (prev > 0 ? prev - 1 : 604800)); // Reset to 1 week when done
    }, 1000);

    return () => {
      clearInterval(dailyInterval);
      clearInterval(weeklyInterval);
    };
  }, []);

  useEffect(() => {
    // Animate daily progress bar
    Animated.timing(progressDaily, {
      toValue: 1,
      duration: timeLeftDaily * 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeftDaily]);

  useEffect(() => {
    // Animate weekly progress bar
    Animated.timing(progressWeekly, {
      toValue: 1,
      duration: timeLeftWeekly * 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeftWeekly]);

  const formatTime = (seconds) => {
    if (seconds >= 86400) {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressWidthDaily = progressDaily.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const progressWidthWeekly = progressWeekly.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const dailyNumbers = [30, 2, 41, 39, 11];
  const weeklyNumbers = [8, 15, 27, 36, 42];

  const handleBuyTicket = () => {
    Alert.alert(
      "Buy Ticket",
      "Buy any Biggi Data bundle to get a free daily draw ticket!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "View Data Plans", 
          onPress: () => navigation.navigate("DataPurchaseScreen") 
        }
      ]
    );
  };

  const handleCheckEligibility = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        "Eligibility Check",
        `Daily Draw: ${ticketsPurchased}/1 ticket(s) purchased\nWeekly Draw: ${weeklyPurchases}/5 purchases this week`,
        [
          { text: "OK" }
        ]
      );
    }, 1000);
  };

  const renderDailyTab = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Prize Info */}
      <LinearGradient
        colors={["#FF8C00", "#FF5C00"]}
        style={styles.prizeCard}
      >
        <View style={styles.prizeHeader}>
          <Ionicons name="trophy" size={24} color="#FFF" />
          <Text style={styles.prizeTitle}>Daily Prize</Text>
        </View>
        
        <Text style={styles.prizeAmount}>₦2,000</Text>
        <Text style={styles.prizeSubtitle}>Two Thousand Naira</Text>
        
        <View style={styles.ticketInfo}>
          <View style={styles.ticketIcon}>
            <Ionicons name="ticket" size={20} color="#FFF" />
          </View>
          <Text style={styles.ticketText}>
            Get 1 free ticket for every data purchase
          </Text>
        </View>
      </LinearGradient>

      {/* Countdown Timer */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownHeader}>
          <Ionicons name="time" size={20} color={BRAND_COLORS.primary} />
          <Text style={styles.countdownTitle}>Next Draw Countdown</Text>
        </View>
        
        <Text style={styles.countdownTime}>{formatTime(timeLeftDaily)}</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidthDaily }]}
          />
        </View>
        
        <Text style={styles.countdownSubtext}>
          Daily draw at 7:30 PM
        </Text>
      </View>

      {/* Your Tickets */}
      <View style={styles.ticketsCard}>
        <View style={styles.ticketsHeader}>
          <Text style={styles.ticketsTitle}>Your Tickets</Text>
          <TouchableOpacity 
            style={styles.eligibilityButton}
            onPress={handleCheckEligibility}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={BRAND_COLORS.primary} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={16} color={BRAND_COLORS.primary} />
                <Text style={styles.eligibilityText}>Check Eligibility</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.ticketCountContainer}>
          <View style={styles.ticketCount}>
            <Text style={styles.ticketCountNumber}>{ticketsPurchased}</Text>
            <Text style={styles.ticketCountLabel}>Tickets Today</Text>
          </View>
          <View style={styles.ticketDivider} />
          <View style={styles.ticketCount}>
            <Text style={styles.ticketCountNumber}>1</Text>
            <Text style={styles.ticketCountLabel}>Required to Enter</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.buyTicketButton}
          onPress={handleBuyTicket}
        >
          <Ionicons name="cart" size={20} color="#FFF" />
          <Text style={styles.buyTicketText}>Buy Data to Get Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Numbers */}
      <View style={styles.numbersCard}>
        <Text style={styles.numbersTitle}>Today's Winning Numbers</Text>
        <View style={styles.numbersGrid}>
          {dailyNumbers.map((num, index) => (
            <LinearGradient
              key={index}
              colors={["#FFB75E", "#FF7A00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.numberBadge}
            >
              <Text style={styles.numberText}>{num}</Text>
            </LinearGradient>
          ))}
        </View>
        <Text style={styles.numbersSubtext}>
          Drawn today at 7:30 PM
        </Text>
      </View>
    </Animated.View>
  );

  const renderWeeklyTab = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Weekly Prize Info */}
      <LinearGradient
        colors={["#4A00E0", "#8E2DE2"]}
        style={styles.prizeCard}
      >
        <View style={styles.prizeHeader}>
          <Ionicons name="trophy-outline" size={24} color="#FFF" />
          <Text style={styles.prizeTitle}>Weekly Jackpot</Text>
        </View>
        
        <Text style={styles.prizeAmount}>₦5,000</Text>
        <Text style={styles.prizeSubtitle}>Five Thousand Naira</Text>
        
        <View style={styles.ticketInfo}>
          <View style={[styles.ticketIcon, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Ionicons name="calendar" size={20} color="#FFF" />
          </View>
          <Text style={styles.ticketText}>
            Make 5 data purchases this week to qualify
          </Text>
        </View>
      </LinearGradient>

      {/* Weekly Countdown */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownHeader}>
          <Ionicons name="calendar" size={20} color="#8E2DE2" />
          <Text style={[styles.countdownTitle, { color: '#8E2DE2' }]}>Weekly Draw Countdown</Text>
        </View>
        
        <Text style={[styles.countdownTime, { color: '#8E2DE2' }]}>{formatTime(timeLeftWeekly)}</Text>
        
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { 
              width: progressWidthWeekly,
              backgroundColor: '#8E2DE2'
            }]}
          />
        </View>
        
        <Text style={styles.countdownSubtext}>
          Weekly draw every Sunday at 7:30 PM
        </Text>
      </View>

      {/* Weekly Progress */}
      <View style={styles.weeklyProgressCard}>
        <Text style={styles.weeklyProgressTitle}>Your Weekly Progress</Text>
        
        <View style={styles.progressRow}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>{weeklyPurchases}</Text>
            <Text style={styles.progressLabel}>Purchases This Week</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>5</Text>
            <Text style={styles.progressLabel}>Required</Text>
          </View>
        </View>
        
        <View style={styles.weeklyBarContainer}>
          <View 
            style={[
              styles.weeklyBar, 
              { width: `${(weeklyPurchases / 5) * 100}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.weeklyProgressText}>
          {weeklyPurchases >= 5 
            ? "🎉 You're eligible for the weekly draw!" 
            : `Make ${5 - weeklyPurchases} more purchase(s) to qualify`}
        </Text>
      </View>

      {/* Weekly Numbers */}
      <View style={styles.numbersCard}>
        <Text style={styles.numbersTitle}>Last Week's Winning Numbers</Text>
        <View style={styles.numbersGrid}>
          {weeklyNumbers.map((num, index) => (
            <LinearGradient
              key={index}
              colors={["#8E2DE2", "#4A00E0"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.numberBadge}
            >
              <Text style={styles.numberText}>{num}</Text>
            </LinearGradient>
          ))}
        </View>
        <Text style={styles.numbersSubtext}>
          Drawn last Sunday at 7:30 PM
        </Text>
      </View>
    </Animated.View>
  );

  const renderWinnersList = () => (
    <View style={styles.winnersCard}>
      <View style={styles.winnersHeader}>
        <Ionicons name="podium" size={20} color={BRAND_COLORS.primary} />
        <Text style={styles.winnersTitle}>Recent Winners</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {winners.map((winner) => (
        <View key={winner.id} style={styles.winnerRow}>
          <View style={styles.winnerInfo}>
            <View style={styles.winnerAvatar}>
              <Text style={styles.winnerInitial}>
                {winner.name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerTime}>{winner.time}</Text>
            </View>
          </View>
          <Text style={styles.winnerAmount}>{winner.amount}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#FF7A00", "#FF5C00"]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <Ionicons name="sparkles" size={16} color="#FFF" />
            <Text style={styles.headerBadgeText}>Lucky Draw</Text>
          </View>
          <Text style={styles.headerTitle}>Daily & Weekly Draws</Text>
          <Text style={styles.headerSubtitle}>Win cash prizes with every purchase</Text>
        </View>
        
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "daily" && styles.activeTab]}
          onPress={() => setActiveTab("daily")}
        >
          <Ionicons 
            name="calendar" 
            size={20} 
            color={activeTab === "daily" ? "#FFF" : BRAND_COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "daily" && styles.activeTabText
          ]}>
            Daily Draw
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "weekly" && styles.activeTab]}
          onPress={() => setActiveTab("weekly")}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeTab === "weekly" ? "#FFF" : BRAND_COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "weekly" && styles.activeTabText
          ]}>
            Weekly Draw
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Tab Content */}
        {activeTab === "daily" ? renderDailyTab() : renderWeeklyTab()}
        
        {/* Recent Winners (Shared) */}
        {renderWinnersList()}
        
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Buy any Biggi Data bundle</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Get automatic draw entries</Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Check results daily at 7:30 PM</Text>
            </View>
          </View>
        </View>
        
        {/* Terms */}
        <View style={styles.termsCard}>
          <Ionicons name="alert-circle" size={20} color={BRAND_COLORS.warning} />
          <Text style={styles.termsText}>
            • One ticket per data purchase{"\n"}
            • Winners notified in app & via email{"\n"}
            • Pairs transferred to winners within 24 hours{"\n"}
            • Winners list published daily
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DailyLuckyDrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#FFF",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 12,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  infoButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: BRAND_COLORS.primary,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: "600",
    color: BRAND_COLORS.textSecondary,
  },
  activeTabText: {
    color: "#FFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  prizeCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  prizeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  prizeTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  prizeAmount: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "900",
    marginVertical: 5,
  },
  prizeSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 15,
  },
  ticketInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 12,
  },
  ticketIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ticketText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  countdownCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: BRAND_COLORS.textPrimary,
  },
  countdownTime: {
    fontSize: 32,
    fontWeight: "800",
    color: BRAND_COLORS.primary,
    textAlign: "center",
    marginBottom: 15,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: 6,
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 3,
  },
  countdownSubtext: {
    textAlign: "center",
    color: BRAND_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 10,
  },
  ticketsCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ticketsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  ticketsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
  },
  eligibilityButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A0010",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eligibilityText: {
    color: BRAND_COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  ticketCountContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  ticketCount: {
    alignItems: "center",
    flex: 1,
  },
  ticketCountNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: BRAND_COLORS.primary,
  },
  ticketCountLabel: {
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
    marginTop: 4,
  },
  ticketDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
  },
  buyTicketButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  buyTicketText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  numbersCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  numbersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.textPrimary,
    marginBottom: 15,
    textAlign: "center",
  },
  numbersGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  numberBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  numberText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "800",
  },
  numbersSubtext: {
    textAlign: "center",
    color: BRAND_COLORS.textSecondary,
    fontSize: 12,
  },
  weeklyProgressCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyProgressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  progressInfo: {
    alignItems: "center",
    flex: 1,
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8E2DE2",
  },
  progressLabel: {
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
    marginTop: 4,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
  },
  weeklyBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 15,
  },
  weeklyBar: {
    height: 8,
    backgroundColor: "#8E2DE2",
    borderRadius: 4,
  },
  weeklyProgressText: {
    textAlign: "center",
    color: BRAND_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  winnersCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  winnersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  winnersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  seeAllText: {
    color: BRAND_COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  winnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  winnerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  winnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF7A0020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  winnerInitial: {
    color: BRAND_COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  winnerName: {
    fontSize: 14,
    fontWeight: "600",
    color: BRAND_COLORS.textPrimary,
  },
  winnerTime: {
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
  },
  winnerAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.success,
  },
  infoSection: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoStep: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF7A0020",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepNumberText: {
    color: BRAND_COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  stepText: {
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  termsCard: {
    flexDirection: "row",
    backgroundColor: "#FFF8E1",
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FFECB3",
  },
  termsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 12,
    color: "#795548",
    lineHeight: 18,
  },
});