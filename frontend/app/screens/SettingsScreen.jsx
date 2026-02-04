// screens/SettingsScreen.jsx
import React, { useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch,
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import FloatingBottomNav from "../../components/FloatingBottomNav";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            logout();
            navigation.navigate("loginScreen");
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent. All your data will be deleted immediately.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive",
          onPress: () => navigation.navigate("screens/DeleteAccountScreen")
        }
      ]
    );
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { 
          icon: "person-outline", 
          label: "Profile Settings", 
          route: "screens/ProfileScreen",
          color: "#007BFF"
        },
        { 
          icon: "lock-closed-outline", 
          label: "Change Password", 
          route: "resetpassword",
          color: "#28A745"
        },
        { 
          icon: "card-outline", 
          label: "Payment Methods", 
          route: "screens/PaymentMethodsScreen",
          color: "#FFC107"
        },
      ]
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          label: "Push Notifications",
          type: "switch",
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
          color: "#17A2B8"
        },
        { 
          icon: "language-outline", 
          label: "Language", 
          route: "screens/LanguageScreen",
          color: "#6F42C1"
        },
        { 
          icon: "moon-outline", 
          label: "Dark Mode", 
          type: "switch",
          value: false,
          onValueChange: () => {},
          color: "#343A40"
        },
      ]
    },
    {
      title: "Support & Legal",
      items: [
        { 
          icon: "help-circle-outline", 
          label: "Help & Support", 
          route: "screens/SupportScreen",
          color: "#20C997"
        },
        { 
          icon: "document-text-outline", 
          label: "Terms & Conditions", 
          route: "screens/TermsScreen",
          color: "#FD7E14"
        },
        { 
          icon: "shield-checkmark-outline", 
          label: "Privacy Policy", 
          route: "screens/PrivacyScreen",
          color: "#E83E8C"
        },
        { 
          icon: "information-circle-outline", 
          label: "About Biggidata", 
          route: "screens/AboutScreen",
          color: "#6C757D"
        },
      ]
    },
    {
      title: "Danger Zone",
      items: [
        { 
          icon: "log-out-outline", 
          label: "Logout", 
          action: handleLogout,
          color: "#DC3545",
          isDestructive: true
        },
        { 
          icon: "trash-outline", 
          label: "Delete Account", 
          action: handleDeleteAccount,
          color: "#DC3545",
          isDestructive: true
        },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* User Info */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#FF7A00" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.username || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
          <Text style={styles.userPhone}>{user?.phone || "No phone number"}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate("screens/ProfileScreen")}
        >
          <Ionicons name="create-outline" size={18} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {/* Settings List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.option}
                  onPress={() => {
                    if (item.route) navigation.navigate(item.route);
                    if (item.action) item.action();
                  }}
                  disabled={item.type === "switch"}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <Text style={[
                    styles.optionLabel,
                    item.isDestructive && styles.destructiveText
                  ]}>
                    {item.label}
                  </Text>
                  
                  {item.type === "switch" ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onValueChange}
                      trackColor={{ false: "#767577", true: "#FF7A00" }}
                      thumbColor={item.value ? "#fff" : "#f4f3f4"}
                      style={{ marginLeft: "auto" }}
                    />
                  ) : (
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={item.isDestructive ? "#DC3545" : "#999"} 
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Biggidata v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 Biggidata. All rights reserved.</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF7A0020",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    paddingLeft: 10,
  },
  sectionContent: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    flex: 1,
  },
  destructiveText: {
    color: "#DC3545",
  },
  appInfo: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  appVersion: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  appCopyright: {
    fontSize: 12,
    color: "#999",
  },
});