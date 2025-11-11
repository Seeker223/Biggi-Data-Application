import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const NotificationScreen = () => {
  const navigation = useNavigation();

  const notifications = [
    {
      id: 1,
      title: "Reminder!",
      message: "You can participate in our daily game for free once you grab your ticket",
      time: "17:00 - Oct 25",
      icon: "notifications-outline",
      color: "#FF8C00",
      section: "Today",
    },
    {
      id: 2,
      title: "New Update",
      message: "Get as many tickets as you want when you buy any bundle",
      time: "17:00 - Oct 25",
      icon: "star-outline",
      color: "#FF8C00",
      section: "Today",
    },
    {
      id: 3,
      title: "Transactions",
      message: "A new transaction has been registered",
      time: "17:00 - Oct 25",
      sub: "Data Purchase | 2GB  | -₦1200",
      icon: "cash-outline",
      color: "#FF8C00",
      section: "Yesterday",
    },
    {
      id: 4,
      title: "Daily Games Update",
      message:
        "Congratulations! you are one of our daily winners today, grab your reward on the reward tab now",
      time: "17:00 - Oct 25",
      icon: "notifications",
      color: "#FF8C00",
      tag: "Claim",
      section: "Yesterday",
    },
    {
      id: 5,
      title: "Weekly Pl Result Check",
      message:
        "We recommend that you check the result tab to see if you won.",
      time: "17:00 - Oct 25",
      icon: "trending-down",
      color: "#FF8C00",
      section: "This Weekend",
    },
    {
      id: 6,
      title: "Daily Games Update",
      message:
        "Daily games results are out, we recommend you check it out.",
      time: "17:00 - Oct 25",
      icon: "cash-multiple",
      color: "#FF8C00",
      section: "This Weekend",
    },
  ];

  const grouped = notifications.reduce((acc, item) => {
    acc[item.section] = acc[item.section] || [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <Ionicons name="notifications" size={24} color="#FF8C00" />
      </View>

      {/* Scrollable Notifications */}
      <ScrollView style={styles.scroll}>
        {Object.keys(grouped).map((section) => (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>
            {grouped[section].map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  {item.sub && (
                    <Text style={styles.sub}>{item.sub}</Text>
                  )}
                  {item.tag && (
                    <TouchableOpacity style={styles.tagButton}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.time}>{item.time}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate("(tabs)/homeScreen")}>
          <Ionicons name="home-outline" size={26} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navIcon} onPress={() => navigation.navigate("Notifications")}>
          <Ionicons name="notifications" size={26} color="#FF8C00" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FF8C00",
    fontFamily: "Poppins-Bold",
  },
  scroll: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    marginBottom: 8,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD6A5",
  },
  iconWrapper: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  message: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#444",
    marginTop: 2,
  },
  sub: {
    color: "#007AFF",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginTop: 3,
  },
  tagButton: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  tagText: {
    fontFamily: "Poppins-Medium",
    color: "#fff",
    fontSize: 12,
  },
  time: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginLeft: 10,
    alignSelf: "flex-start",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  navIcon:{
    marginBottom: 20
 }
});
