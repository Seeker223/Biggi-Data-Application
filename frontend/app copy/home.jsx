// app/home.jsx
import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <ProtectedRoute>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-2xl font-bold mb-4">Welcome to Home</Text>
        <Text className="text-2xl font-bold mb-4">{user?.email}</Text>
        <Text className="mb-6">Your token: {user?.token?.slice(0, 20)}...</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    </ProtectedRoute>
  );
};

export default Home;

// // app/home.jsx
// import React, { useContext } from "react";
// import { View, Text, Button } from "react-native";
// import { useRouter } from "expo-router";
// import { AuthContext } from "../context/AuthContext";
// import ProtectedRoute from "../components/ProtectedRoute";


// export default function HomeScreen() {
//   const { user, logout } = useContext(AuthContext);
//   const router = useRouter();

//   const handleLogout = async () => {
//     await logout();
//     router.replace("/login");
//   };

//   return (
//     <ProtectedRoute>
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <Text style={{ fontSize: 20 }}>Welcome back!</Text>
//       <Text style={{ marginVertical: 10 }}>{user?.email}</Text>
//       <Button title="Logout" onPress={handleLogout} />
//     </View>
//     </ProtectedRoute>
//   );
// }
