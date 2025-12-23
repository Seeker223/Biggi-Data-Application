// frontend/app/notificationScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform,
  SectionList,
  Image,
  Alert,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import api, { getWithdrawalHistory } from "../utils/api";

// Import images if you have them
// import images from '../../constants/images';

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    markNotificationsAsSeen, 
    refreshUser,
    notificationCount 
  } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'deposits', 'withdrawals', 'games'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [games, setGames] = useState([]);

  // Fetch all notification data
  const fetchNotificationData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDepositHistory(),
        fetchWithdrawalHistory(),
        fetchGameHistory()
      ]);
    } catch (error) {
      console.error("Error fetching notification data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch deposit history
  const fetchDepositHistory = async () => {
    try {
      const response = await api.get("/wallet/deposit-history");
      if (response.data?.success) {
        setDeposits(response.data.deposits || []);
      }
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    }
  };

  // Fetch withdrawal history
  const fetchWithdrawalHistory = async () => {
    try {
      const response = await getWithdrawalHistory();
      if (response.data?.success) {
        setWithdrawals(response.data.withdrawals || []);
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
    }
  };

  // Fetch game history from user context
  const fetchGameHistory = () => {
    if (user?.dailyNumberDraw) {
      const sortedGames = [...user.dailyNumberDraw]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20); // Limit to 20 recent games
      setGames(sortedGames);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotificationData();
  }, [fetchNotificationData]);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      markNotificationsAsSeen();
      fetchNotificationData();
    }, [])
  );

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotificationData();
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get deposit icon and color
  const getDepositIcon = (status) => {
    switch (status) {
      case "successful":
        return {
          icon: "checkmark-circle",
          color: "#28a745",
          label: "Successful",
          bgColor: "#E8F5E9"
        };
      case "pending":
        return {
          icon: "time-outline",
          color: "#FF7A00",
          label: "Pending",
          bgColor: "#FFF3E0"
        };
      case "failed":
        return {
          icon: "close-circle",
          color: "#ff5252",
          label: "Failed",
          bgColor: "#FFEBEE"
        };
      default:
        return {
          icon: "cash-outline",
          color: "#FF7A00",
          label: "Deposit",
          bgColor: "#FFF3E0"
        };
    }
  };

  // Get withdrawal icon and color
  const getWithdrawalIcon = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: "checkmark-circle",
          color: "#28a745",
          label: "Completed",
          bgColor: "#E8F5E9"
        };
      case "pending":
        return {
          icon: "time-outline",
          color: "#FF7A00",
          label: "Processing",
          bgColor: "#FFF3E0"
        };
      case "rejected":
        return {
          icon: "close-circle",
          color: "#ff5252",
          label: "Failed",
          bgColor: "#FFEBEE"
        };
      default:
        return {
          icon: "card-outline",
          color: "#FF7A00",
          label: "Withdrawal",
          bgColor: "#FFF3E0"
        };
    }
  };

  // Get game icon and color
  const getGameIcon = (item) => {
    if (item.isWinner) {
      return {
        icon: "trophy",
        color: "#FFD700",
        label: "Winner!",
        bgColor: "#FFF8E1"
      };
    }
    return {
      icon: "game-controller",
      color: "#2196F3",
      label: "Game Play",
      bgColor: "#E3F2FD"
    };
  };

  // Filter items based on active tab
  const getFilteredItems = () => {
    const allItems = [
      ...deposits.map(d => ({ ...d, type: 'deposit', date: d.createdAt })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal', date: w.createdAt })),
      ...games.map(g => ({ ...g, type: 'game', date: g.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activeTab === 'all') return allItems;
    if (activeTab === 'deposits') return allItems.filter(item => item.type === 'deposit');
    if (activeTab === 'withdrawals') return allItems.filter(item => item.type === 'withdrawal');
    if (activeTab === 'games') return allItems.filter(item => item.type === 'game');
    
    return allItems;
  };

  // Render notification item
  const renderNotificationItem = ({ item }) => {
    if (item.type === 'deposit') {
      const iconInfo = getDepositIcon(item.status);
      return (
        <TouchableOpacity style={styles.notificationCard}>
          <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bgColor }]}>
            <Ionicons name={iconInfo.icon} size={20} color={iconInfo.color} />
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Deposit {iconInfo.label}</Text>
              <Text style={[styles.notificationAmount, { color: iconInfo.color }]}>
                ₦{item.amount?.toLocaleString()}
              </Text>
            </View>
            
            <Text style={styles.notificationMessage}>
              {item.channel === "flutterwave" ? "Flutterwave Payment" : "Bank Transfer"}
              {item.reference && ` • Ref: ${item.reference.substring(0, 10)}...`}
            </Text>
            
            <View style={styles.notificationFooter}>
              <View style={[styles.statusTag, { backgroundColor: iconInfo.bgColor }]}>
                <Text style={[styles.statusText, { color: iconInfo.color }]}>
                  {iconInfo.label}
                </Text>
              </View>
              <Text style={styles.notificationTime}>
                {formatTime(item.createdAt)} • {formatFullDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'withdrawal') {
      const iconInfo = getWithdrawalIcon(item.status);
      return (
        <TouchableOpacity style={styles.notificationCard}>
          <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bgColor }]}>
            <Ionicons name={iconInfo.icon} size={20} color={iconInfo.color} />
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Withdrawal {iconInfo.label}</Text>
              <Text style={[styles.notificationAmount, { color: iconInfo.color }]}>
                ₦{item.amount?.toLocaleString()}
              </Text>
            </View>
            
            <Text style={styles.notificationMessage}>
              {item.bank} • {item.accountNumber?.substring(item.accountNumber.length - 4)}
              {item.reference && ` • Ref: ${item.reference.substring(0, 10)}...`}
            </Text>
            
            <View style={styles.notificationFooter}>
              <View style={[styles.statusTag, { backgroundColor: iconInfo.bgColor }]}>
                <Text style={[styles.statusText, { color: iconInfo.color }]}>
                  {iconInfo.label}
                </Text>
              </View>
              <Text style={styles.notificationTime}>
                {formatTime(item.createdAt)} • {formatFullDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (item.type === 'game') {
      const iconInfo = getGameIcon(item);
      const picked = Array.isArray(item.numbers) ? item.numbers : [];
      const result = Array.isArray(item.result) ? item.result : [];
      const matchedCount = result.length 
        ? picked.filter(n => result.includes(n)).length 
        : 0;

      return (
        <TouchableOpacity style={styles.notificationCard}>
          <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bgColor }]}>
            <Ionicons name={iconInfo.icon} size={20} color={iconInfo.color} />
          </View>
          
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Daily Number Game</Text>
              <Text style={[styles.notificationAmount, { color: iconInfo.color }]}>
                {iconInfo.label}
              </Text>
            </View>
            
            <View style={styles.gameNumbers}>
              <Text style={styles.gameNumbersLabel}>Your picks: </Text>
              <View style={styles.numberList}>
                {picked.slice(0, 5).map((n, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.numberBubble,
                      result.includes(n) && styles.matchedBubble
                    ]}
                  >
                    <Text style={[
                      styles.numberText,
                      result.includes(n) && styles.matchedText
                    ]}>
                      {n}
                    </Text>
                  </View>
                ))}
                {picked.length > 5 && (
                  <Text style={styles.moreNumbers}>+{picked.length - 5}</Text>
                )}
              </View>
            </View>
            
            {result.length > 0 && (
              <View style={styles.gameResult}>
                <Text style={styles.gameResultLabel}>Draw result: </Text>
                <View style={styles.numberList}>
                  {result.slice(0, 3).map((r, idx) => (
                    <View key={idx} style={styles.resultBubble}>
                      <Text style={styles.resultText}>{r}</Text>
                    </View>
                  ))}
                  {result.length > 3 && (
                    <Text style={styles.moreNumbers}>+{result.length - 3}</Text>
                  )}
                </View>
                <Text style={styles.matchCount}>{matchedCount} matched</Text>
              </View>
            )}
            
            <View style={styles.notificationFooter}>
              <View style={[styles.statusTag, { backgroundColor: iconInfo.bgColor }]}>
                <Text style={[styles.statusText, { color: iconInfo.color }]}>
                  {iconInfo.label}
                </Text>
              </View>
              <Text style={styles.notificationTime}>
                {formatTime(item.createdAt)} • {formatFullDate(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    let message = "";
    let icon = "notifications-outline";
    let actionText = "";

    switch (activeTab) {
      case 'deposits':
        message = "No deposit history yet";
        actionText = "Make Your First Deposit";
        break;
      case 'withdrawals':
        message = "No withdrawals yet";
        actionText = "Make a Withdrawal";
        break;
      case 'games':
        message = "No game history yet";
        actionText = "Play Daily Game";
        break;
      default:
        message = "No notifications yet";
        actionText = "Explore the App";
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={icon} size={80} color="#FF7A00" style={{ opacity: 0.5 }} />
        <Text style={styles.emptyText}>{message}</Text>
        <Text style={styles.emptySubText}>
          Your {activeTab === 'all' ? 'activities' : activeTab} will appear here
        </Text>
        <TouchableOpacity 
          style={styles.emptyActionButton}
          onPress={() => {
            if (activeTab === 'deposits') navigation.navigate("depositScreen");
            else if (activeTab === 'withdrawals') navigation.navigate("withdrawScreen");
            else if (activeTab === 'games') navigation.navigate("DailyNumberDrawScreen");
            else navigation.navigate("homeScreen");
          }}
        >
          <Ionicons name="rocket" size={20} color="#fff" />
          <Text style={styles.emptyActionText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'deposits', label: 'Deposits', icon: 'cash' },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'card' },
    { id: 'games', label: 'Games', icon: 'game-controller' },
  ];

  // If loading
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight}>
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#FF7A00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{deposits.length}</Text>
            <Text style={styles.statLabel}>Deposits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{withdrawals.length}</Text>
            <Text style={styles.statLabel}>Withdrawals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{games.length}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {games.filter(g => g.isWinner).length}
            </Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.id ? "#fff" : "#666"} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notifications List */}
        <FlatList
          data={getFilteredItems()}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => `${item.type}-${item._id || index}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF7A00"]}
              tintColor="#FF7A00"
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF7A00",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notificationBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 10,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#FF7A00",
    opacity: 0.3,
  },
  tabsContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tabsContent: {
    paddingVertical: 5,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: "#FF7A00",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  notificationAmount: {
    fontSize: 16,
    fontWeight: "800",
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444",
    marginBottom: 10,
    lineHeight: 18,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
  },
  // Game specific styles
  gameNumbers: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gameNumbersLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  numberList: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },
  numberBubble: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  matchedBubble: {
    backgroundColor: "#FF7A00",
  },
  numberText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#333",
  },
  matchedText: {
    color: "#fff",
  },
  moreNumbers: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  gameResult: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gameResultLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  resultBubble: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  resultText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  matchCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontWeight: "500",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A00",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
    gap: 10,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});