import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; // ✅ important
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../utils/api"; // your API base
import { Ionicons } from "@expo/vector-icons";

export default function SecurityPinScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // ✅ replaces route.params.email

  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);
  };

  const handleVerifyPin = async () => {
    try {
      setLoading(true);
      const enteredPin = pin.join("");
      const res = await api.post("/auth/verify-pin", { email, pin: enteredPin });

      if (res.data.success) {
        Alert.alert("Success", "PIN verified successfully!");
        router.push("/(auth)/login");
      } else {
        Alert.alert("Error", "Invalid PIN. Please try again.");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Verification failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
    try {
      setLoading(true);
      await api.post("/auth/send-pin", { email });
      Alert.alert("Success", "A new PIN has been sent to your email.");
    } catch (err) {
      Alert.alert("Error", "Failed to resend PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1 bg-gray-100 rounded-t-3xl items-center justify-center px-5">
        <Text className="text-2xl font-bold mb-4 text-black">Security Pin</Text>
        <Text className="text-center text-base font-semibold mb-6 text-black">
          Enter Security Pin From Your Email
        </Text>

        <View className="flex-row justify-center mb-6">
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(text) => handleInputChange(text, index)}
              maxLength={1}
              keyboardType="numeric"
              className="w-10 h-10 mx-2 border border-gray-400 text-center rounded-full text-lg bg-white"
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleVerifyPin}
          disabled={loading}
          className="bg-black rounded-full w-2/3 py-3 mb-4"
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? "Verifying..." : "Accept"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResendPin}
          disabled={loading}
          className="bg-gray-200 rounded-full w-2/3 py-3 mb-8"
        >
          <Text className="text-center text-black font-semibold text-base">
            {loading ? "Sending..." : "Send Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
