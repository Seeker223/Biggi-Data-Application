import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return alert("Please enter your credentials.");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) router.replace("/(tabs)/homeScreen");
    else alert(res.error || "Login failed");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Welcome</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Username Or Email</Text>
          <TextInput
            placeholder="example@example.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#475569"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          style={[styles.loginButton, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Logging In..." : "Log In"}
          </Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgottenPassword")}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={styles.signupButton}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Fingerprint Access */}
        <Text style={styles.fingerprintText}>
          Use <Text style={styles.fingerprintHighlight}>Fingerprint</Text> To
          Access
        </Text>

        {/* Social Login */}
        <Text style={styles.socialText}>or sign up with</Text>
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Ionicons name="logo-google" size={22} color="#DB4437" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

//
// ─── STYLES ────────────────────────────────────────────────────────────────
//

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    backgroundColor: "#000000",
    borderBottomLeftRadius: "10%",
    borderBottomRightRadius: "10%",
    paddingBottom: 32,
    paddingTop: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#FF8000",
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    borderRadius: 50,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  loginButton: {
    backgroundColor: "#000",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  forgotButton: {
    marginTop: 12,
  },
  forgotText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  signupButton: {
    backgroundColor: "#E5E7EB",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 16,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 16,
  },
  fingerprintText: {
    marginTop: 24,
    color: "#4B5563",
    fontSize: 14,
  },
  fingerprintHighlight: {
    color: "#FF8000",
    fontWeight: "600",
  },
  socialText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 14,
  },
  socialRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 24,
  },
  socialIcon: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 50,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  footerText: {
    color: "#4B5563",
    fontSize: 14,
  },
  footerLink: {
    color: "#FF8000",
    fontWeight: "600",
    fontSize: 14,
  },
});

// import React, { useState, useContext } from "react";
// import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
// import { useRouter } from "expo-router";
// import { AuthContext } from "../../context/AuthContext";
// import { Ionicons } from "@expo/vector-icons";

// export default function LoginScreen() {
//   const { login } = useContext(AuthContext);
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [secure, setSecure] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) return alert("Please enter your credentials.");
//     setLoading(true);
//     const res = await login(email, password);
//     setLoading(false);
//     if (res.success) router.replace("/(tabs)/homeScreen"); // Redirect after success
//     else alert(res.error || "Login failed");
//   };

//   return (
//     <ScrollView
//       contentContainerStyle={{ flexGrow: 1 }}
//       showsVerticalScrollIndicator={false}
//       className="bg-white"
//     >
//       {/* Top Header */}
//       <View className="bg-black rounded-b-[10%] pb-8 pt-16 items-center justify-center">
//         <Text className="text-orange-500 text-2xl font-bold">Welcome</Text>
//       </View>

//       {/* Form */}
//       <View className="flex-1 items-center justify-center px-6 pt-8">
//         {/* Username or Email */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">
//             Username Or Email
//           </Text>
//           <TextInput
//             placeholder="example@example.com"
//             placeholderTextColor="#9CA3AF"
//             value={email}
//             onChangeText={setEmail}
//             className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
//           />
//         </View>

//         {/* Password */}
//         <View className="w-full mb-4 relative">
//           <Text className="text-gray-700 font-semibold mb-1">Password</Text>
//           <View className="flex-row items-center bg-gray-200 rounded-full px-4">
//             <TextInput
//               placeholder="••••••••"
//               placeholderTextColor="#9CA3AF"
//               secureTextEntry={secure}
//               value={password}
//               onChangeText={setPassword}
//               className="flex-1 py-3 text-base text-gray-900"
//             />
//             <TouchableOpacity onPress={() => setSecure(!secure)}>
//               <Ionicons
//                 name={secure ? "eye-off-outline" : "eye-outline"}
//                 size={20}
//                 color="#475569"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Buttons */}
//         <TouchableOpacity
//           disabled={loading}
//           onPress={handleLogin}
//           className="bg-black w-5/6 rounded-full py-3 mt-4 items-center"
//         >
//           <Text className="text-white font-semibold text-base">
//             {loading ? "Logging In..." : "Log In"}
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => router.push("/(auth)/forgottenPassword")}
//           className="mt-3"
//         >
//           <Text className="text-gray-500 font-medium">Forgot Password?</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => router.push("/(auth)/signup")}
//           className="bg-gray-200 w-5/6 rounded-full py-3 mt-4 items-center"
//         >
//           <Text className="text-gray-900 font-semibold text-base">Sign Up</Text>
//         </TouchableOpacity>

//         {/* Fingerprint */}
//         <Text className="mt-6 text-gray-600 text-sm">
//           Use <Text className="text-orange-500 font-semibold">Fingerprint</Text> To Access
//         </Text>

//         {/* Social Login */}
//         <Text className="mt-4 text-gray-500 text-sm">or sign up with</Text>
//         <View className="flex-row mt-3 space-x-6">
//           <TouchableOpacity className="p-2 border border-gray-300 rounded-full">
//             <Ionicons name="logo-facebook" size={22} color="#1877F2" />
//           </TouchableOpacity>
//           <TouchableOpacity className="p-2 border border-gray-300 rounded-full">
//             <Ionicons name="logo-google" size={22} color="#DB4437" />
//           </TouchableOpacity>
//         </View>

//         {/* Footer */}
//         <View className="flex-row mt-6">
//           <Text className="text-gray-600 text-sm">
//             Don’t have an account?{" "}
//           </Text>
//           <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
//             <Text className="text-orange-500 text-sm font-semibold">Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }
