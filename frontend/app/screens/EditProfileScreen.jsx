import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, Image } from "react-native";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import FloatingBottomNav from "../../components/FloatingBottomNav";

export default function EditProfileScreen() {
  const [isEnabled, setIsEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <Header title="Edit My Profile" />

      <View style={styles.content}>
        <Image
          source={require("../../assets/images/profile.png")}
          style={styles.avatar}
        />
        <Text style={styles.name}>Jason Deredz</Text>
        <Text style={styles.id}>ID: 25030024</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value="Jason Deredz" />
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value="+234 77778484894" />
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.input} value="example@example.com" />

          <View style={styles.toggleRow}>
            <Text style={styles.label}>Push Notifications</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => setIsEnabled(!isEnabled)}
              value={isEnabled}
            />
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
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
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#000" },
  name: { fontSize: 18, fontWeight: "700", marginTop: 10, color: "#003322" },
  id: { color: "#555" },
  section: { width: "85%", marginTop: 30 },
  label: { color: "#000", fontSize: 14, marginTop: 15 },
  input: {
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  button: {
    backgroundColor: "#FF7A00",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 25,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
