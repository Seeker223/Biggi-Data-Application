
import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { getDepositHistory } from "../utils/api";

const NotificationScreen = () => {
  const navigation = useNavigation();
  const { user, markNotificationsAsSeen } = useContext(AuthContext);
  
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedDeposits, setGroupedDeposits] = useState({});

  // Function to fetch deposit history
  const fetchDepositHistory = async () => {
    try {
      const response = await getDepositHistory();
      if (response.data?.success) {
        setDeposits(response.data.deposits || []);
        groupDepositsByDate(response.data.deposits || []);
      }
    } catch (error) {
      console.error("Error fetching deposit history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDepositHistory();
  }, []);

  // Refresh when screen comes into focus
 // Update useFocusEffect to mark notifications as seen
useFocusEffect(
  React.useCallback(() => {
    markNotificationsAsSeen(); // Mark all notifications as seen
    fetchDepositHistory(); // Fetch fresh data
  }, [])
);

  // Function to group deposits by date
  const groupDepositsByDate = (depositList) => {
    const grouped = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    depositList.forEach((deposit) => {
      const depositDate = new Date(deposit.createdAt);
      let section = "";

      // Determine the section based on date
      if (depositDate.toDateString() === today.toDateString()) {
        section = "Today";
      } else if (depositDate.toDateString() === yesterday.toDateString()) {
        section = "Yesterday";
      } else {
        // For older dates, show the actual date
        const daysAgo = Math.floor((today - depositDate) / (1000 * 60 * 60 * 24));
        if (daysAgo <= 7) {
          section = `${daysAgo} days ago`;
        } else {
          section = depositDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
      }

      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(deposit);
    });

    setGroupedDeposits(grouped);
  };

  // Function to format the date for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Function to format the full date
  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to get icon and color based on deposit status
  const getDepositIcon = (status) => {
    switch (status) {
      case "successful":
        return {
          icon: "checkmark-circle",
          color: "#28a745",
          label: "Successful"
        };
      case "pending":
        return {
          icon: "time-outline",
          color: "#FF7A00", // Brand orange
          label: "Pending"
        };
      case "failed":
        return {
          icon: "close-circle",
          color: "#ff5252",
          label: "Failed"
        };
      default:
        return {
          icon: "cash-outline",
          color: "#FF7A00", // Brand orange
          label: "Deposit"
        };
    }
  };

  // Function to handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDepositHistory();
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Ionicons name="notifications" size={24} color="#FF7A00" />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
            <Text style={styles.loadingText}>Loading deposit history...</Text>
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
          <Text style={styles.headerTitle}>Deposit History</Text>
          <TouchableOpacity>
            <Ionicons name="notifications" size={24} color="#FF7A00" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{deposits.length}</Text>
            <Text style={styles.statLabel}>Total Deposits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ₦{deposits
                .filter(d => d.status === "successful")
                .reduce((sum, d) => sum + d.amount, 0)
                .toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Deposited</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {deposits.filter(d => d.status === "successful").length}
            </Text>
            <Text style={styles.statLabel}>Successful</Text>
          </View>
        </View>

        {/* Scrollable Deposit History */}
        <ScrollView 
          style={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF7A00"]}
              tintColor="#FF7A00"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {deposits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={80} color="#FF7A00" style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>No deposit history yet</Text>
              <Text style={styles.emptySubText}>
                Your deposit transactions will appear here
              </Text>
              <TouchableOpacity 
                style={styles.depositButton}
                onPress={() => navigation.navigate("depositScreen")}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.depositButtonText}>Make Your First Deposit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.keys(groupedDeposits).map((section) => (
              <View key={section}>
                <Text style={styles.sectionTitle}>{section}</Text>
                {groupedDeposits[section].map((deposit) => {
                  const iconInfo = getDepositIcon(deposit.status);
                  return (
                    <View key={deposit._id} style={styles.depositCard}>
                      <View style={[styles.iconWrapper, { backgroundColor: iconInfo.color }]}>
                        <Ionicons name={iconInfo.icon} size={20} color="#fff" />
                      </View>

                      <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                          <Text style={styles.title}>Deposit {iconInfo.label}</Text>
                          <Text style={[
                            styles.amountText,
                            { color: iconInfo.color }
                          ]}>
                            ₦{deposit.amount.toLocaleString()}
                          </Text>
                        </View>
                        
                        <Text style={styles.message}>
                          {deposit.channel === "flutterwave" ? "Flutterwave Payment" : "Bank Transfer"}
                        </Text>
                        
                        {deposit.reference && (
                          <Text style={styles.sub}>
                            Ref: {deposit.reference.substring(0, 20)}...
                          </Text>
                        )}
                        
                        <View style={styles.tagContainer}>
                          <View style={[
                            styles.statusTag,
                            { backgroundColor: iconInfo.color + "20" }
                          ]}>
                            <Text style={[
                              styles.tagText,
                              { color: iconInfo.color }
                            ]}>
                              {iconInfo.label}
                            </Text>
                          </View>
                          {deposit.flutterwaveTransactionId && (
                            <View style={styles.transactionIdTag}>
                              <Text style={styles.transactionIdText}>
                                ID: {deposit.flutterwaveTransactionId.substring(0, 10)}...
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.timeContainer}>
                        <Text style={styles.time}>{formatTime(deposit.createdAt)}</Text>
                        <Text style={styles.date}>{formatFullDate(deposit.createdAt)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {/* Floating Action Button - Raised above native buttons */}
        <TouchableOpacity 
          style={styles.floatingActionButton}
          onPress={() => navigation.navigate("depositScreen")}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
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
    fontFamily: "Poppins-Bold",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
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
    fontFamily: "Poppins-Bold",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 6,
    fontFamily: "Poppins-SemiBold",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#FF7A00",
    opacity: 0.3,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 120, // Extra padding for FAB
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
    marginTop: 20,
    fontFamily: "Poppins-Bold",
  },
  depositCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  amountText: {
    fontSize: 17,
    fontWeight: "800",
    fontFamily: "Poppins-Bold",
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444",
    marginBottom: 4,
    fontFamily: "Poppins-Medium",
  },
  sub: {
    color: "#666",
    fontWeight: "500",
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Poppins-Medium",
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  transactionIdTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagText: {
    fontWeight: "600",
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
  transactionIdText: {
    fontWeight: "500",
    fontSize: 11,
    color: "#666",
    fontFamily: "Poppins-Medium",
  },
  timeContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
    minWidth: 70,
  },
  time: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
    fontFamily: "Poppins-SemiBold",
  },
  date: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999",
    fontFamily: "Poppins-Medium",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontWeight: "500",
    color: "#666",
    fontFamily: "Poppins-Medium",
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
    fontFamily: "Poppins-Bold",
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Poppins-Medium",
  },
  depositButton: {
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
  depositButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },
  // Floating Action Button - Raised above native buttons
  floatingActionButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 90 : 100, // Raised above native buttons
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 1000,
  },
});