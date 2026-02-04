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
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import api, { getWithdrawalHistory } from "../utils/api";

const { width } = Dimensions.get("window");

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    markNotificationsAsSeen, 
    refreshUser,
    notificationCount 
  } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'deposits', 'withdrawals', 'data'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [dataPurchases, setDataPurchases] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Fetch all notification data
  const fetchNotificationData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDepositHistory(),
        fetchWithdrawalHistory(),
        fetchDataPurchaseHistory()
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

  // Fetch data purchase history
  const fetchDataPurchaseHistory = async () => {
    try {
      // This endpoint needs to be created in your backend
      // For now, we'll use user's dataBundleCount and create sample data
      if (user?.dataBundleCount > 0) {
        const samplePurchases = Array.from({ length: Math.min(10, user.dataBundleCount) }, (_, i) => ({
          id: `data-${i}`,
          network: ["MTN", "Airtel", "Glo", "9mobile"][i % 4],
          phone: "080" + (100000000 + i).toString().substring(1),
          plan: `${[1, 2, 5, 10, 20][i % 5]}GB Data Plan`,
          amount: [500, 1000, 2000, 3000, 5000][i % 5],
          status: "success",
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        }));
        setDataPurchases(samplePurchases);
      }
    } catch (error) {
      console.error("Error fetching data purchase history:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNotificationData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get deposit icon and color
  const getDepositIcon = (status) => {
    switch (status) {
      case "successful":
        return {
          icon: "arrow-down-circle",
          color: "#28a745",
          label: "Successful",
          bgColor: "#E8F5E9"
        };
      case "pending":
        return {
          icon: "time",
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
          icon: "cash",
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
          icon: "arrow-up-circle",
          color: "#28a745",
          label: "Completed",
          bgColor: "#E8F5E9"
        };
      case "pending":
        return {
          icon: "time",
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
          icon: "card",
          color: "#FF7A00",
          label: "Withdrawal",
          bgColor: "#FFF3E0"
        };
    }
  };

  // Get data purchase icon and color
  const getDataPurchaseIcon = (status) => {
    switch (status) {
      case "success":
        return {
          icon: "wifi",
          color: "#2196F3",
          label: "Delivered",
          bgColor: "#E3F2FD"
        };
      case "pending":
        return {
          icon: "time",
          color: "#FF7A00",
          label: "Processing",
          bgColor: "#FFF3E0"
        };
      default:
        return {
          icon: "wifi-outline",
          color: "#2196F3",
          label: "Data Purchase",
          bgColor: "#E3F2FD"
        };
    }
  };

  // Filter items based on active tab
  const getFilteredItems = () => {
    const allItems = [
      ...deposits.map(d => ({ ...d, type: 'deposit', date: d.createdAt })),
      ...withdrawals.map(w => ({ ...w, type: 'withdrawal', date: w.createdAt })),
      ...dataPurchases.map(d => ({ ...d, type: 'data', date: d.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activeTab === 'all') return allItems;
    if (activeTab === 'deposits') return allItems.filter(item => item.type === 'deposit');
    if (activeTab === 'withdrawals') return allItems.filter(item => item.type === 'withdrawal');
    if (activeTab === 'data') return allItems.filter(item => item.type === 'data');
    
    return allItems;
  };

  // Render notification item
  const renderNotificationItem = ({ item, index }) => {
    if (item.type === 'deposit') {
      const iconInfo = getDepositIcon(item.status);
      return (
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: index * 50 }}
        >
          <TouchableOpacity style={styles.notificationCard}>
            <LinearGradient
              colors={[iconInfo.bgColor, iconInfo.bgColor]}
              style={styles.iconWrapper}
            >
              <Ionicons name={iconInfo.icon} size={22} color={iconInfo.color} />
            </LinearGradient>
            
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
        </MotiView>
      );
    }

    if (item.type === 'withdrawal') {
      const iconInfo = getWithdrawalIcon(item.status);
      return (
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: index * 50 }}
        >
          <TouchableOpacity style={styles.notificationCard}>
            <LinearGradient
              colors={[iconInfo.bgColor, iconInfo.bgColor]}
              style={styles.iconWrapper}
            >
              <Ionicons name={iconInfo.icon} size={22} color={iconInfo.color} />
            </LinearGradient>
            
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
        </MotiView>
      );
    }

    if (item.type === 'data') {
      const iconInfo = getDataPurchaseIcon(item.status);
      return (
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: index * 50 }}
        >
          <TouchableOpacity style={styles.notificationCard}>
            <LinearGradient
              colors={[iconInfo.bgColor, iconInfo.bgColor]}
              style={styles.iconWrapper}
            >
              <Ionicons name={iconInfo.icon} size={22} color={iconInfo.color} />
            </LinearGradient>
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>Data Purchase</Text>
                <Text style={[styles.notificationAmount, { color: iconInfo.color }]}>
                  ₦{item.amount?.toLocaleString()}
                </Text>
              </View>
              
              <View style={styles.dataDetails}>
                <View style={styles.dataDetailRow}>
                  <Ionicons name="phone-portrait" size={12} color="#666" />
                  <Text style={styles.dataDetailText}>{item.phone}</Text>
                </View>
                <View style={styles.dataDetailRow}>
                  <Ionicons name="wifi" size={12} color="#666" />
                  <Text style={styles.dataDetailText}>{item.network}</Text>
                </View>
                <View style={styles.dataDetailRow}>
                  <Ionicons name="document-text" size={12} color="#666" />
                  <Text style={styles.dataDetailText}>{item.plan}</Text>
                </View>
              </View>
              
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
        </MotiView>
      );
    }

    return null;
  };

  // Render empty state
  const renderEmptyState = () => {
    let message = "";
    let icon = "notifications-outline";
    let actionText = "";
    let actionRoute = "homeScreen";

    switch (activeTab) {
      case 'deposits':
        message = "No deposit history yet";
        actionText = "Make Your First Deposit";
        actionRoute = "depositScreen";
        break;
      case 'withdrawals':
        message = "No withdrawals yet";
        actionText = "Make a Withdrawal";
        actionRoute = "withdrawScreen";
        break;
      case 'data':
        message = "No data purchases yet";
        actionText = "Buy Data Bundle";
        actionRoute = "screens/BuyDataScreen";
        break;
      default:
        message = "No notifications yet";
        actionText = "Explore the App";
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={icon} size={80} color="#FF7A00" style={{ opacity: 0.5 }} />
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.emptyText}
        >
          {message}
        </MotiText>
        <Text style={styles.emptySubText}>
          Your {activeTab === 'all' ? 'activities' : activeTab} will appear here
        </Text>
        <TouchableOpacity 
          style={styles.emptyActionButton}
          onPress={() => navigation.navigate(actionRoute)}
        >
          <Ionicons name="rocket" size={20} color="#fff" />
          <Text style={styles.emptyActionText}>{actionText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Tabs configuration
  const tabs = [
    { id: 'all', label: 'All', icon: 'apps', count: deposits.length + withdrawals.length + dataPurchases.length },
    { id: 'deposits', label: 'Deposits', icon: 'cash', count: deposits.length },
    { id: 'withdrawals', label: 'Withdrawals', icon: 'card', count: withdrawals.length },
    { id: 'data', label: 'Data', icon: 'wifi', count: dataPurchases.length },
  ];

  // If loading
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={["#FF7A00", "#FF5C00"]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={{ width: 26 }} />
          </LinearGradient>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#FF7A00", "#FF5C00"]}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity History</Text>
          <View style={styles.headerRight}>
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount}</Text>
              </View>
            )}
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Stats Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          style={styles.statsContainer}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={["#28A745", "#20C997"]}
                style={styles.statIcon}
              >
                <Ionicons name="arrow-down" size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{deposits.length}</Text>
                <Text style={styles.statLabel}>Deposits</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <LinearGradient
                colors={["#007BFF", "#0056CC"]}
                style={styles.statIcon}
              >
                <Ionicons name="arrow-up" size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{withdrawals.length}</Text>
                <Text style={styles.statLabel}>Withdrawals</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <LinearGradient
                colors={["#FF7A00", "#FF9A00"]}
                style={styles.statIcon}
              >
                <Ionicons name="wifi" size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>{dataPurchases.length}</Text>
                <Text style={styles.statLabel}>Data Purchases</Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab, index) => (
            <MotiView
              key={tab.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 + (index * 100) }}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === tab.id && styles.tabButtonActive
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={18} 
                  color={activeTab === tab.id ? "#fff" : "#666"} 
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[
                    styles.tabBadge,
                    activeTab === tab.id && styles.tabBadgeActive
                  ]}>
                    <Text style={styles.tabBadgeText}>{tab.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>

        {/* Notifications List */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={getFilteredItems()}
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => `${item.type}-${item._id || item.id || index}`}
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
            ListHeaderComponent={
              getFilteredItems().length > 0 ? (
                <Text style={styles.sectionTitle}>
                  Recent Activities
                </Text>
              ) : null
            }
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  notificationBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    backgroundColor: "#f9f9f9",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
  },
  tabsContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  tabsContent: {
    paddingVertical: 5,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 12,
    gap: 8,
    position: "relative",
  },
  tabButtonActive: {
    backgroundColor: "#FF7A00",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  tabBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  tabBadgeActive: {
    backgroundColor: "#fff",
  },
  tabBadgeText: {
    color: "#FF3B30",
    fontSize: 10,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
    paddingLeft: 5,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
    paddingTop: 10,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  notificationAmount: {
    fontSize: 17,
    fontWeight: "800",
  },
  notificationMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
    marginBottom: 12,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
  },
  // Data purchase specific styles
  dataDetails: {
    marginBottom: 12,
  },
  dataDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  dataDetailText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontWeight: "500",
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  emptyActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A00",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 30,
    gap: 10,
    shadowColor: "#FF7A00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});