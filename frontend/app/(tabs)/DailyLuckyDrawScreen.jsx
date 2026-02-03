// frontend/app/(tabs)/DailyLuckyDrawScreen.jsx
import React, { useEffect, useRef, useState, useContext } from "react";
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
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import api, { TEMP_DISABLE_GAME_AND_REDEEM } from "../../utils/api";

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
  const { user, refreshUser } = useContext(AuthContext);
  if (TEMP_DISABLE_GAME_AND_REDEEM) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, color: "#000", textAlign: "center", marginBottom: 12 }}>
          The Lucky Draw feature is temporarily disabled for Play Store review.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#FF7A00", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Return</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const [activeTab, setActiveTab] = useState("daily"); // 'daily' or 'monthly'
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drawHistory, setDrawHistory] = useState([]);
  const [winners, setWinners] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState({
    purchases: 0,
    required: 5,
    daysLeft: 15
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      startPulseAnimation();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      await refreshUser();
      
      // Load user's game history
      if (user?.dailyNumberDraw) {
        const sortedHistory = [...user.dailyNumberDraw]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setDrawHistory(sortedHistory);
      }

      // Calculate monthly progress
      const purchasesThisMonth = user?.dataBundleCount || 0;
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysLeft = daysInMonth - now.getDate();
      
      setMonthlyProgress({
        purchases: purchasesThisMonth,
        required: 5,
        daysLeft: Math.max(0, daysLeft)
      });

      // Load recent winners from backend
      loadRecentWinners();
      
    } catch (error) {
      console.error("Error loading draw data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentWinners = async () => {
    try {
      // This would come from your backend API
      // For now, we'll create sample data based on user's own wins
      const userWins = (user?.dailyNumberDraw || [])
        .filter(game => game.isWinner)
        .map(game => ({
          id: game._id,
          name: user?.username || "User",
          amount: "₦2,000",
          time: new Date(game.createdAt).toLocaleDateString(),
          type: "daily"
        }));

      // Add some sample winners
      const sampleWinners = [
        { id: "1", name: "Alex Johnson", amount: "₦2,000", time: "Today", type: "daily" },
        { id: "2", name: "Sarah Williams", amount: "₦2,000", time: "Yesterday", type: "daily" },
        { id: "3", name: "Michael Brown", amount: "₦5,000", time: "3 days ago", type: "monthly" },
        { id: "4", name: "Emma Davis", amount: "₦2,000", time: "5 days ago", type: "daily" },
        { id: "5", name: "James Wilson", amount: "₦5,000", time: "Last month", type: "monthly" },
      ];

      setWinners([...userWins, ...sampleWinners].slice(0, 5));
    } catch (error) {
      console.error("Error loading winners:", error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleBuyTicket = () => {
    Alert.alert(
      "Get Tickets",
      "Buy any Biggi Data bundle to get free draw tickets!",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "View Data Plans", 
          onPress: () => navigation.navigate("screens/BuyDataScreen") 
        }
      ]
    );
  };

  const handlePlayDailyGame = () => {
    const tickets = user?.tickets || 0;
    if (tickets <= 0) {
      Alert.alert(
        "No Tickets",
        "You need tickets to play. Buy a data bundle to get tickets.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Get Tickets", onPress: handleBuyTicket }
        ]
      );
      return;
    }
    navigation.navigate("screens/DailyNumberDrawScreen");
  };

  const handleCheckEligibility = () => {
    const dailyPlays = drawHistory.length;
    const monthlyPurchases = monthlyProgress.purchases;
    const tickets = user?.tickets || 0;
    
    Alert.alert(
      "Your Eligibility Status",
      `🎫 Available Tickets: ${tickets}\n` +
      `📅 Daily Plays This Month: ${dailyPlays}\n` +
      `🛒 Monthly Purchases: ${monthlyPurchases}/${monthlyProgress.required}\n` +
      `📊 Monthly Progress: ${Math.round((monthlyPurchases / monthlyProgress.required) * 100)}%\n` +
      `⏳ Days Left This Month: ${monthlyProgress.daysLeft}`,
      [{ text: "OK" }]
    );
  };

  const handleViewHistory = () => {
    navigation.navigate("screens/DailyHistoryScreen");
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getNextDrawTime = () => {
    const now = new Date();
    const nextDraw = new Date();
    nextDraw.setHours(19, 30, 0, 0); // 7:30 PM
    
    if (now > nextDraw) {
      nextDraw.setDate(nextDraw.getDate() + 1);
    }
    
    const diffMs = nextDraw - now;
    return Math.floor(diffMs / 1000);
  };

  const getNextMonthlyDrawTime = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 0);
    
    const diffMs = lastDay - now;
    return Math.floor(diffMs / 1000);
  };

  const [timeLeftDaily, setTimeLeftDaily] = useState(getNextDrawTime());
  const [timeLeftMonthly, setTimeLeftMonthly] = useState(getNextMonthlyDrawTime());

  useEffect(() => {
    const dailyInterval = setInterval(() => {
      setTimeLeftDaily(prev => (prev > 0 ? prev - 1 : getNextDrawTime()));
    }, 1000);

    const monthlyInterval = setInterval(() => {
      setTimeLeftMonthly(prev => (prev > 0 ? prev - 1 : getNextMonthlyDrawTime()));
    }, 1000);

    return () => {
      clearInterval(dailyInterval);
      clearInterval(monthlyInterval);
    };
  }, []);

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
        
        <Text style={styles.countdownSubtext}>
          Daily draw at 7:30 PM • Today's Numbers: {drawHistory[0]?.numbers?.join(", ") || "Not drawn yet"}
        </Text>
      </View>

      {/* Your Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Your Daily Stats</Text>
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
                <Text style={styles.eligibilityText}>Check Status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.tickets || 0}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{drawHistory.length}</Text>
            <Text style={styles.statLabel}>Total Plays</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {drawHistory.filter(g => g.isWinner).length}
            </Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </View>
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
            style={[styles.playButton, (user?.tickets || 0) <= 0 && styles.disabledButton]}
            onPress={handlePlayDailyGame}
          >
            <Ionicons name="game-controller" size={20} color="#FFF" />
            <Text style={styles.playButtonText}>Play Daily Draw</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Recent Plays */}
      {drawHistory.length > 0 && (
        <View style={styles.recentPlaysCard}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Your Recent Plays</Text>
            <TouchableOpacity onPress={handleViewHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {drawHistory.slice(0, 3).map((play, index) => (
            <View key={play._id || index} style={styles.playItem}>
              <View style={styles.playDate}>
                <Text style={styles.playDay}>
                  {new Date(play.createdAt).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={styles.playNumber}>
                  {new Date(play.createdAt).getDate()}
                </Text>
              </View>
              <View style={styles.playDetails}>
                <Text style={styles.playNumbers}>
                  Numbers: {play.numbers?.join(", ")}
                </Text>
                <Text style={[
                  styles.playResult,
                  play.isWinner ? styles.winText : styles.lossText
                ]}>
                  {play.isWinner ? "🎉 You Won!" : "No win"}
                </Text>
              </View>
              <View style={[
                styles.playStatus,
                play.isWinner ? styles.winBadge : styles.lossBadge
              ]}>
                <Text style={styles.playStatusText}>
                  {play.isWinner ? "WIN" : "PLAY"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  const renderMonthlyTab = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Monthly Prize Info */}
      <LinearGradient
        colors={["#4A00E0", "#8E2DE2"]}
        style={styles.prizeCard}
      >
        <View style={styles.prizeHeader}>
          <Ionicons name="trophy-outline" size={24} color="#FFF" />
          <Text style={styles.prizeTitle}>Monthly Jackpot</Text>
        </View>
        
        <Text style={styles.prizeAmount}>₦5,000</Text>
        <Text style={styles.prizeSubtitle}>Five Thousand Naira</Text>
        
        <View style={styles.ticketInfo}>
          <View style={[styles.ticketIcon, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Ionicons name="calendar" size={20} color="#FFF" />
          </View>
          <Text style={styles.ticketText}>
            Make 5+ data purchases this month to qualify
          </Text>
        </View>
      </LinearGradient>

      {/* Monthly Countdown */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownHeader}>
          <Ionicons name="calendar" size={20} color="#8E2DE2" />
          <Text style={[styles.countdownTitle, { color: '#8E2DE2' }]}>
            Monthly Draw Countdown
          </Text>
        </View>
        
        <Text style={[styles.countdownTime, { color: '#8E2DE2' }]}>
          {Math.floor(timeLeftMonthly / 86400)} days
        </Text>
        
        <Text style={styles.countdownSubtext}>
          Monthly draw at end of month • Auto-qualify with 5+ purchases
        </Text>
      </View>

      {/* Monthly Progress */}
      <View style={styles.monthlyProgressCard}>
        <Text style={styles.monthlyProgressTitle}>Your Monthly Progress</Text>
        
        <View style={styles.progressRow}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>{monthlyProgress.purchases}</Text>
            <Text style={styles.progressLabel}>Purchases</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>{monthlyProgress.required}</Text>
            <Text style={styles.progressLabel}>Required</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressInfo}>
            <Text style={styles.progressNumber}>{monthlyProgress.daysLeft}</Text>
            <Text style={styles.progressLabel}>Days Left</Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(100, (monthlyProgress.purchases / monthlyProgress.required) * 100)}%`,
                backgroundColor: monthlyProgress.purchases >= monthlyProgress.required ? '#4CAF50' : '#8E2DE2'
              }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {monthlyProgress.purchases >= monthlyProgress.required 
            ? "🎉 You're eligible for the monthly draw!" 
            : `Make ${monthlyProgress.required - monthlyProgress.purchases} more purchase(s) to qualify`}
        </Text>
        
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={handleBuyTicket}
        >
          <Ionicons name="cart" size={18} color="#FFF" />
          <Text style={styles.buyButtonText}>Buy Data to Qualify</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Monthly Draw Benefits</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.benefitText}>Higher Prize Pool (₦5,000)</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.benefitText}>Auto-qualification with 5+ purchases</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.benefitText}>Better odds (fewer participants)</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.benefitText}>Separate from daily draws</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderWinnersList = () => (
    <View style={styles.winnersCard}>
      <View style={styles.winnersHeader}>
        <Ionicons name="podium" size={20} color={BRAND_COLORS.primary} />
        <Text style={styles.winnersTitle}>Recent Winners</Text>
        <View style={styles.winnerTypeFilter}>
          <TouchableOpacity 
            style={[
              styles.winnerTypeButton,
              activeTab === "daily" && styles.activeWinnerType
            ]}
            onPress={() => setActiveTab("daily")}
          >
            <Text style={[
              styles.winnerTypeText,
              activeTab === "daily" && styles.activeWinnerTypeText
            ]}>
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.winnerTypeButton,
              activeTab === "monthly" && styles.activeWinnerType
            ]}
            onPress={() => setActiveTab("monthly")}
          >
            <Text style={[
              styles.winnerTypeText,
              activeTab === "monthly" && styles.activeWinnerTypeText
            ]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {winners
        .filter(winner => winner.type === activeTab || activeTab === "daily")
        .map((winner) => (
          <View key={winner.id} style={styles.winnerRow}>
            <View style={styles.winnerInfo}>
              <View style={[
                styles.winnerAvatar,
                winner.type === "monthly" ? styles.monthlyAvatar : styles.dailyAvatar
              ]}>
                <Text style={styles.winnerInitial}>
                  {winner.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerTime}>{winner.time}</Text>
              </View>
            </View>
            <View style={styles.winnerPrize}>
              <Text style={styles.winnerAmount}>{winner.amount}</Text>
              <Text style={styles.winnerTypeLabel}>
                {winner.type === "monthly" ? "Monthly" : "Daily"}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_COLORS.primary} />
        <Text style={styles.loadingText}>Loading draws...</Text>
      </View>
    );
  }

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
            <Ionicons name="ticket" size={16} color="#FFF" />
            <Text style={styles.headerBadgeText}>Draws & Games</Text>
          </View>
          <Text style={styles.headerTitle}>Daily & Monthly Draws</Text>
          <Text style={styles.headerSubtitle}>Win cash with every data purchase</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => Alert.alert(
            "Draw Information",
            "• Daily Draw: Win ₦2,000 every day at 7:30 PM\n" +
            "• Monthly Draw: Win ₦5,000 at month-end\n" +
            "• 1 Ticket per data purchase\n" +
            "• Auto-qualify for monthly with 5+ purchases"
          )}
        >
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
          style={[styles.tabButton, activeTab === "monthly" && styles.activeTab]}
          onPress={() => setActiveTab("monthly")}
        >
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            color={activeTab === "monthly" ? "#FFF" : BRAND_COLORS.textSecondary} 
          />
          <Text style={[
            styles.tabText,
            activeTab === "monthly" && styles.activeTabText
          ]}>
            Monthly Draw
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={BRAND_COLORS.primary}
          />
        }
      >
        {/* Active Tab Content */}
        {activeTab === "daily" ? renderDailyTab() : renderMonthlyTab()}
        
        {/* Recent Winners */}
        {renderWinnersList()}
        
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How It Works</Text>
          <View style={styles.infoSteps}>
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Buy any Biggi Data bundle</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Get automatic draw entries</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Check results daily/monthly</Text>
            </View>
          </View>
        </View>
        
        {/* Terms */}
        <View style={styles.termsCard}>
          <Ionicons name="alert-circle" size={20} color={BRAND_COLORS.warning} />
          <Text style={styles.termsText}>
            • 1 ticket per data purchase{"\n"}
            • Daily draw: 7:30 PM every day{"\n"}
            • Monthly draw: End of each month{"\n"}
            • Winners notified in app & via email{"\n"}
            • Prizes transferred within 24 hours
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    color: BRAND_COLORS.textSecondary,
    fontSize: 14,
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
    marginBottom: 10,
  },
  countdownSubtext: {
    textAlign: "center",
    color: BRAND_COLORS.textSecondary,
    fontSize: 12,
  },
  statsCard: {
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
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statsTitle: {
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
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: BRAND_COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: BRAND_COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  playButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#CCC",
    opacity: 0.6,
  },
  recentPlaysCard: {
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
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
  },
  viewAllText: {
    color: BRAND_COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  playItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  playDate: {
    width: 50,
    alignItems: "center",
  },
  playDay: {
    fontSize: 11,
    color: BRAND_COLORS.textSecondary,
    fontWeight: "600",
  },
  playNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: BRAND_COLORS.textPrimary,
  },
  playDetails: {
    flex: 1,
    marginLeft: 15,
  },
  playNumbers: {
    fontSize: 13,
    color: BRAND_COLORS.textPrimary,
    fontWeight: "500",
  },
  playResult: {
    fontSize: 12,
    marginTop: 4,
  },
  winText: {
    color: BRAND_COLORS.success,
    fontWeight: "600",
  },
  lossText: {
    color: BRAND_COLORS.textSecondary,
  },
  playStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  winBadge: {
    backgroundColor: "#28A74510",
  },
  lossBadge: {
    backgroundColor: "#F0F0F0",
  },
  playStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  monthlyProgressCard: {
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
  monthlyProgressTitle: {
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
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    color: BRAND_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 15,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8E2DE2",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  buyButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  benefitsCard: {
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
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
    marginBottom: 15,
  },
  benefitsList: {
    gap: 10,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 13,
    color: BRAND_COLORS.textPrimary,
    flex: 1,
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
    marginBottom: 15,
  },
  winnersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND_COLORS.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  winnerTypeFilter: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    padding: 2,
  },
  winnerTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  activeWinnerType: {
    backgroundColor: BRAND_COLORS.primary,
  },
  winnerTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BRAND_COLORS.textSecondary,
  },
  activeWinnerTypeText: {
    color: "#FFF",
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dailyAvatar: {
    backgroundColor: "#FF7A0020",
  },
  monthlyAvatar: {
    backgroundColor: "#8E2DE220",
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
  winnerPrize: {
    alignItems: "flex-end",
  },
  winnerAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: BRAND_COLORS.primary,
  },
  winnerTypeLabel: {
    fontSize: 10,
    color: BRAND_COLORS.textSecondary,
    marginTop: 2,
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
  infoSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  step: {
    alignItems: "center",
    flex: 1,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF7A0020",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepNumber: {
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
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#F0F0F0",
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