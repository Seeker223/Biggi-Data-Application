import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import { getLeaderboard } from "../utils/api";

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard();
    setLeaders(data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Top Buyers Leaderboard</Text>

      <FlatList
        data={leaders}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>

            <Image
              source={{ uri: item.photo || "https://i.imgur.com/0y8Ftya.png" }}
              style={styles.avatar}
            />

            <View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.count}>{item.dataBundleCount} purchases</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  row: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  rank: { fontSize: 20, width: 30, textAlign: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "600" },
  count: { fontSize: 14, color: "#555" },
});
