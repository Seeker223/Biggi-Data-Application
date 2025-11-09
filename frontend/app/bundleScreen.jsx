
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";
import React from "react";

export default function BundleScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>Bundle Screen</Text>
      <Link href="/home" asChild>
        <Button title="Go Back Home" />
      </Link>
    </View>
  );
}

