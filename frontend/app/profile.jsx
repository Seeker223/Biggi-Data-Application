import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import React from "react";

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>This is the Profile Screen</Text>
      <Link href="/" asChild>
        <Button title="Go Back Home" />
      </Link>
    </View>
  );
}


