import React, { useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import FloatingBottomNav from "../../components/FloatingBottomNav";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  // -----------------------------------------------------
  // Auto redirect to login if user is null
  // -----------------------------------------------------
  useEffect(() => {
    if (!user) {
      navigation.replace("(auth)/login"); // safer than reset
    }
  }, [user]);

  const options = [
    {
      icon: "person-outline",
      label: "Edit Profile",
      route: "screens/EditProfileScreen",
    },
    {
      icon: "settings-outline",
      label: "Settings",
      // route: "screens/SettingsScreen",
    },
    { icon: "headset-outline", label: "Support" },
    {
      icon: "log-out-outline",
      label: "Logout",
      onPress: () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Logout",
            style: "destructive",
            onPress: () => {
              logout(); // ✅ context handles token & user
            },
          },
        ]);
      },
    },
  ];

  if (!user) {
    return null; // prevents UI flash before redirect
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <View style={styles.content}>
        <Image
          source={{
            uri:
              user.photo ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user.username}</Text>
        <Text style={styles.id}>ID: {user._id?.slice(-8)}</Text>

        <View style={styles.options}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={item.onPress || (() => item.route && navigation.navigate(item.route))}
            >
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FloatingBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: {
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 30,
    flex: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#000",
  },
  name: { fontSize: 18, fontWeight: "700", marginTop: 10, color: "#003322" },
  id: { color: "#555" },
  options: { marginTop: 40, width: "80%" },
  option: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  iconCircle: {
    backgroundColor: "#007BFF",
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: { marginLeft: 15, fontSize: 16, color: "#003322" },
});
