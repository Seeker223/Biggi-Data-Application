import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { depositHistoryApi } from "../../utils/api";

const DepositHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------
  // LOAD HISTORY
  // ---------------------------------------------------------
  const loadHistory = async () => {
    try {
      const res = await depositHistoryApi();
      setHistory(res.data.history || []);
    } catch (err) {
      console.log("Error loading deposit history:", err.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, []);

  // ---------------------------------------------------------
  // RENDER EACH TRANSACTION ITEM
  // ---------------------------------------------------------
  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.amountText}>₦{item.amount}</Text>

          <Text
            style={[
              styles.status,
              item.status === "success"
                ? styles.success
                : styles.pending,
            ]}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.meta}>
          Method: {item.method || "Monnify"}
        </Text>

        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    );
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading deposit history...</Text>
      </View>
    );
  }

  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------
  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No deposit history yet.</Text>
        <Text style={styles.emptySub}>Your deposits will appear here.</Text>
      </View>
    );
  }

  // ---------------------------------------------------------
  // MAIN LIST
  // ---------------------------------------------------------
  return (
    <FlatList
      data={history}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 15 }}
    />
  );
};

export default DepositHistoryScreen;

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    marginTop: 6,
    fontSize: 13,
    color: "#444",
  },
  date: {
    marginTop: 3,
    fontSize: 12,
    color: "#777",
  },
  status: {
    fontWeight: "bold",
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  success: {
    backgroundColor: "#D4F8D4",
    color: "#0A8917",
  },
  pending: {
    backgroundColor: "#FFECC7",
    color: "#A66B00",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySub: {
    marginTop: 5,
    fontSize: 14,
    color: "#666",
  },
});
// Ui design 2
// import React, { useEffect, useState, useContext } from "react";
// import { View, Text, FlatList, ActivityIndicator } from "react-native";
// import { AuthContext } from "../context/AuthContext";

// export default function DepositHistoryScreen() {
//   const { getDepositHistory } = useContext(AuthContext);

//   const [loading, setLoading] = useState(true);
//   const [history, setHistory] = useState([]);

//   const loadHistory = async () => {
//     setLoading(true);
//     const data = await getDepositHistory();
//     setHistory(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadHistory();

//     // auto-refresh every 10 seconds
//     const interval = setInterval(loadHistory, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const renderItem = ({ item }) => (
//     <View
//       style={{
//         backgroundColor: "#fff",
//         padding: 15,
//         marginVertical: 6,
//         marginHorizontal: 12,
//         borderRadius: 10,
//         borderWidth: 0.5,
//         borderColor: "#ddd",
//       }}
//     >
//       <Text style={{ fontSize: 16, fontWeight: "600" }}>
//         ₦{item.amount}
//       </Text>

//       <Text
//         style={{
//           fontSize: 14,
//           color: item.status === "successful" ? "green" : "orange",
//           marginTop: 3,
//         }}
//       >
//         {item.status.toUpperCase()}
//       </Text>

//       <Text style={{ marginTop: 4, color: "#555" }}>
//         Ref: {item.reference}
//       </Text>

//       <Text style={{ marginTop: 4, color: "#777", fontSize: 12 }}>
//         {new Date(item.createdAt).toLocaleString()}
//       </Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="blue" />
//         <Text style={{ marginTop: 10 }}>Loading deposit history...</Text>
//       </View>
//     );
//   }

//   return (
//     <FlatList
//       data={history}
//       keyExtractor={(item) => item._id}
//       renderItem={renderItem}
//       ListEmptyComponent={
//         <Text
//           style={{
//             textAlign: "center",
//             marginTop: 40,
//             fontSize: 16,
//             color: "#666",
//           }}
//         >
//           No deposit activity yet.
//         </Text>
//       }
//     />
//   );
// }
