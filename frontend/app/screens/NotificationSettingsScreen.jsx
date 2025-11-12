import React, { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import FloatingBottomNav from "../../components/FloatingBottomNav";

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState({
    general: true,
    sound: false,
    soundcalls: true,
    vibrate: false,
    transaction: true,
    expense: false,
    budget: true,
    balance: false,
  });

  const toggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <View style={styles.container}>
      <Header title="Notification Settings" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>General Notifications</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("general")}
              value={settings.general}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Sound</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("sound")}
              value={settings.sound}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Sound Calls</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("soundcalls")}
              value={settings.soundcalls}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vibrate</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("vibrate")}
              value={settings.vibrate}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Transaction Updates</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("transaction")}
              value={settings.transaction}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Expense Reminder</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("expense")}
              value={settings.expense}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Budget Notifications</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("budget")}
              value={settings.budget}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Low Balance Alert</Text>
            <Switch
              trackColor={{ false: "#ccc", true: "#FF7A00" }}
              thumbColor="#fff"
              onValueChange={() => toggle("balance")}
              value={settings.balance}
            />
          </View>
        </View>
      </View>

      <FloatingBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  content: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: { fontSize: 16, color: "#000", fontWeight: "500" },
});
