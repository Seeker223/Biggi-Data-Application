import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useNavigation } from "@react-navigation/native";
import FloatingBottomNav from "../../components/FloatingBottomNav";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const options = [
    { icon: "person-outline", label: "Edit Profile", route: "screens/EditProfileScreen" },
    { icon: "settings-outline", label: "Setting", route: "screens/SettingsScreen" },
    { icon: "headset-outline", label: "Support" },
    { icon: "log-out-outline", label: "Logout" },
  ];

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <View style={styles.content}>
        <Image
          source={require("../../assets/images/profile.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>Jason Deredz</Text>
        <Text style={styles.id}>ID: 25030024</Text>

        <View style={styles.options}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => item.route && navigation.navigate(item.route)}
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
