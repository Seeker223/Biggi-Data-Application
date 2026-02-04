import React, { useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import FloatingBottomNav from "../../components/FloatingBottomNav";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // -----------------------------------------------------
  // Auto redirect to login if user is null
  // -----------------------------------------------------
  useEffect(() => {
    if (!user) {
      navigation.replace("(auth)/login");
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const options = [
    {
      icon: "person-circle-outline",
      label: "Edit Profile",
      description: "Update your personal information",
      route: "screens/EditProfileScreen",
      color: "#007BFF",
      gradient: ["#007BFF", "#0056CC"],
    },
    {
      icon: "settings-outline",
      label: "Settings",
      description: "Manage app preferences",
      route: "screens/SettingsScreen",
      color: "#28A745",
      gradient: ["#28A745", "#1E7E34"],
    },
    {
      icon: "card-outline",
      label: "Payment Methods",
      description: "Manage your payment options",
      route: "screens/PaymentMethodsScreen",
      color: "#FFC107",
      gradient: ["#FFC107", "#E0A800"],
    },
    {
      icon: "document-text-outline",
      label: "Transaction History",
      description: "View all your transactions",
      route: "screens/TransactionHistoryScreen",
      color: "#17A2B8",
      gradient: ["#17A2B8", "#138496"],
    },
    {
      icon: "headset-outline",
      label: "Help & Support",
      description: "Get assistance or report issues",
      route: "screens/SupportScreen",
      color: "#6F42C1",
      gradient: ["#6F42C1", "#59359A"],
    },
    {
      icon: "shield-checkmark-outline",
      label: "Privacy & Security",
      description: "Manage your privacy settings",
      route: "screens/PrivacyScreen",
      color: "#20C997",
      gradient: ["#20C997", "#17A589"],
    },
    {
      icon: "log-out-outline",
      label: "Logout",
      description: "Sign out of your account",
      color: "#DC3545",
      gradient: ["#DC3545", "#C82333"],
      onPress: () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => {
              logout();
            },
          },
        ]);
      },
    },
  ];

  if (!user) {
    return null;
  }

  const mainBalance = Number(user.mainBalance || 0);
  const rewardBalance = Number(user.rewardBalance || 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#FF7A00", "#FF5C00"]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons 
              name={refreshing ? "refresh-circle" : "refresh"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate("screens/SettingsScreen")}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.profileCard}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => navigation.navigate("screens/EditProfileScreen")}
            >
              <Image
                source={{
                  uri: user.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatar}
              />
              <View style={styles.editAvatarButton}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <MotiText
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: 200 }}
                style={styles.userName}
              >
                {user.username}
              </MotiText>
              <Text style={styles.userEmail}>{user.email}</Text>
              <View style={styles.userIdContainer}>
                <Ionicons name="finger-print" size={12} color="#666" />
                <Text style={styles.userId}>ID: {user._id?.slice(-8)}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <LinearGradient
                colors={["#FF7A00", "#FF9A00"]}
                style={styles.statIcon}
              >
                <Ionicons name="wallet" size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Main Balance</Text>
                <Text style={styles.statValue}>₦{mainBalance.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <LinearGradient
                colors={["#28A745", "#20C997"]}
                style={styles.statIcon}
              >
                <Ionicons name="gift" size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Reward Balance</Text>
                <Text style={styles.statValue}>₦{rewardBalance.toLocaleString()}</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <LinearGradient
                colors={["#17A2B8", "#20C997"]}
                style={styles.statIcon}
              >
                <Ionicons name="wifi" size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>Data Bundles</Text>
                <Text style={styles.statValue}>{user.dataBundleCount || 0}</Text>
              </View>
            </View>
          </View>
        </MotiView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate("screens/BuyDataScreen")}
            >
              <LinearGradient
                colors={["#FF7A00", "#FF9A00"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Buy Data</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate("depositScreen")}
            >
              <LinearGradient
                colors={["#28A745", "#20C997"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="arrow-down-circle" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate("withdrawScreen")}
            >
              <LinearGradient
                colors={["#007BFF", "#0056CC"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="arrow-up-circle" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate("screens/TransactionHistoryScreen")}
            >
              <LinearGradient
                colors={["#6F42C1", "#59359A"]}
                style={styles.quickActionIcon}
              >
                <Ionicons name="receipt" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.optionsContainer}>
            {options.map((item, index) => (
              <MotiView
                key={index}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 100 }}
              >
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={item.onPress || (() => item.route && navigation.navigate(item.route))}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.optionIconContainer}
                  >
                    <Ionicons name={item.icon} size={22} color="#fff" />
                  </LinearGradient>
                  
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLabel}>{item.label}</Text>
                    <Text style={styles.optionDescription}>{item.description}</Text>
                  </View>
                  
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={item.color} 
                    style={styles.optionArrow}
                  />
                </TouchableOpacity>
              </MotiView>
            ))}
          </View>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {user.phone || "Phone not set"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              Account verified
            </Text>
          </View>
        </View>
      </ScrollView>

      <FloatingBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  refreshButton: {
    padding: 5,
  },
  settingsButton: {
    padding: 5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    marginTop: -40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF7A00",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
    marginLeft: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  userIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  userId: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 18,
    padding: 15,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 10,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
    paddingLeft: 5,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  optionsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: "#666",
  },
  optionArrow: {
    marginLeft: 10,
  },
  accountInfo: {
    backgroundColor: "#f9f9f9",
    borderRadius: 18,
    padding: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
});