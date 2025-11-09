import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNextStep = async () => {
    if (!email) {
      return Alert.alert("Missing Email", "Please enter your registered email address.");
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        "Email Sent 🎉",
        "A password reset link has been sent to your email.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } else {
      Alert.alert("Error", res.error || "Something went wrong, please try again.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      className="bg-white"
    >
      {/* Header */}
      <View className="bg-black rounded-b-[10%] pb-8 pt-16 items-center justify-center">
        <Text className="text-white text-2xl font-bold">Forgot Password</Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center px-6 pt-8 pb-12">
        {/* Reset Info */}
        <Text className="text-xl font-bold text-black mb-2">Reset Password?</Text>
        <Text className="text-center text-gray-600 mb-6 leading-relaxed">
          Enter your registered email address below and we'll send you a link to reset your password.
        </Text>

        {/* Email Input */}
        <View className="w-full mb-4">
          <Text className="text-gray-700 font-semibold mb-1">Enter Email Address</Text>
          <TextInput
            placeholder="example@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
          />
        </View>

        {/* Next Step Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleNextStep}
          className="bg-black w-5/6 rounded-full py-3 mt-4 items-center"
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Sending..." : "Next Step"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          className="bg-gray-200 w-5/6 rounded-full py-3 mt-6 items-center"
        >
          <Text className="text-black font-semibold text-base">Sign Up</Text>
        </TouchableOpacity>

        {/* Social Auth */}
        <Text className="text-gray-500 text-sm mt-8 mb-4">or sign up with</Text>
        <View className="flex-row space-x-6">
          <TouchableOpacity className="border border-gray-400 rounded-full p-3">
            <Ionicons name="logo-facebook" size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity className="border border-gray-400 rounded-full p-3">
            <Ionicons name="logo-google" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row mt-8">
          <Text className="text-gray-600 text-sm">Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-orange-500 text-sm font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
