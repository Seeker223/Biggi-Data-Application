// components/ProtectedRoute.jsx
import React, { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // redirect unauthenticated users
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default ProtectedRoute;
