import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function SignupScreen() {
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
  });

  const [secure, setSecure] = useState(true);
  const [confirmSecure, setConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { username, email, password, phoneNumber, birthDate, confirmPassword } = form;

    if (!username || !email || !password ||!phoneNumber ||!birthDate|| !confirmPassword) {
      return Alert.alert("Missing Fields", "Please fill all required fields.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Password Mismatch", "Passwords do not match.");
    }

    setLoading(true);
    const res = await register(username, email, password, phoneNumber, birthDate);
    setLoading(false);

    if (res.success) {
      Alert.alert(
        "Registration Successful 🎉",
        "A confirmation email has been sent to your inbox.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    } else {
      Alert.alert("Registration Failed", res.error || "Please try again.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Create Account</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Full Name */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#9CA3AF"
            value={form.username}
            onChangeText={(t) => setForm({ ...form, username: t })}
            style={styles.textInput}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="example@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            style={styles.textInput}
          />
        </View>

        {/* Mobile */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            placeholder="+123 456 789"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={form.phoneNumber}
            onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
            style={styles.textInput}
          />
        </View>

        {/* Date of Birth */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Date Of Birth</Text>
          <TextInput
            placeholder="DD / MM / YYYY"
            placeholderTextColor="#9CA3AF"
            value={form.birthDate}
            onChangeText={(t) => setForm({ ...form, birthDate: t })}
            style={styles.textInput}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secure}
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
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

        {/* Confirm Password */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={confirmSecure}
              value={form.confirmPassword}
              onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
              <Ionicons
                name={confirmSecure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#475569"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing, you agree to{" "}
          <Text style={styles.termsHighlight}>Terms of Use</Text> and{" "}
          <Text style={styles.termsHighlight}>Privacy Policy</Text>.
        </Text>

        {/* Sign Up Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleRegister}
          style={[styles.signupButton, loading && { opacity: 0.6 }]}
        >
          <Text style={styles.signupButtonText}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.footerLink}>Log In</Text>
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
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
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
    paddingBottom: 48,
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
  termsText: {
    color: "#4B5563",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  termsHighlight: {
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#000",
    width: "83%",
    borderRadius: 50,
    paddingVertical: 12,
    marginTop: 24,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
// import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { AuthContext } from "../../context/AuthContext";

// export default function SignupScreen() {
//   const { register } = useContext(AuthContext);
//   const router = useRouter();

//   const [form, setForm] = useState({
//     username: "",
//     email: "",
//     mobile: "",
//     dob: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [secure, setSecure] = useState(true);
//   const [confirmSecure, setConfirmSecure] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async () => {
//     const { username, email, password, confirmPassword } = form;

//     if (!username || !email || !password || !confirmPassword) {
//       return Alert.alert("Missing Fields", "Please fill all required fields.");
//     }
//     if (password !== confirmPassword) {
//       return Alert.alert("Password Mismatch", "Passwords do not match.");
//     }

//     setLoading(true);
//     const res = await register(username, email, password);
//     setLoading(false);

//     if (res.success) {
//       Alert.alert(
//         "Registration Successful 🎉",
//         "A confirmation email has been sent to your inbox.",
//         [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
//       );
//     } else {
//       Alert.alert("Registration Failed", res.error || "Please try again.");
//     }
//   };

//   return (
//     <ScrollView
//       contentContainerStyle={{ flexGrow: 1 }}
//       showsVerticalScrollIndicator={false}
//       className="bg-white"
//     >
//       {/* Header */}
//       <View className="bg-black rounded-b-[10%] pb-8 pt-16 items-center justify-center">
//         <Text className="text-orange-500 text-2xl font-bold">Create Account</Text>
//       </View>

//       {/* Form Section */}
//       <View className="flex-1 items-center justify-center px-6 pt-8 pb-12">
//         {/* Full Name */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Full Name</Text>
//           <TextInput
//             placeholder="John Doe"
//             placeholderTextColor="#9CA3AF"
//             value={form.username}
//             onChangeText={(t) => setForm({ ...form, username: t })}
//             className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
//           />
//         </View>

//         {/* Email */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Email</Text>
//           <TextInput
//             placeholder="example@example.com"
//             placeholderTextColor="#9CA3AF"
//             keyboardType="email-address"
//             value={form.email}
//             onChangeText={(t) => setForm({ ...form, email: t })}
//             className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
//           />
//         </View>

//         {/* Mobile Number */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Mobile Number</Text>
//           <TextInput
//             placeholder="+123 456 789"
//             placeholderTextColor="#9CA3AF"
//             keyboardType="phone-pad"
//             value={form.mobile}
//             onChangeText={(t) => setForm({ ...form, mobile: t })}
//             className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
//           />
//         </View>

//         {/* Date of Birth */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Date Of Birth</Text>
//           <TextInput
//             placeholder="DD / MM / YYYY"
//             placeholderTextColor="#9CA3AF"
//             value={form.dob}
//             onChangeText={(t) => setForm({ ...form, dob: t })}
//             className="w-full bg-gray-200 rounded-full px-4 py-3 text-base text-gray-900"
//           />
//         </View>

//         {/* Password */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Password</Text>
//           <View className="flex-row items-center bg-gray-200 rounded-full px-4">
//             <TextInput
//               placeholder="••••••••"
//               placeholderTextColor="#9CA3AF"
//               secureTextEntry={secure}
//               value={form.password}
//               onChangeText={(t) => setForm({ ...form, password: t })}
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

//         {/* Confirm Password */}
//         <View className="w-full mb-4">
//           <Text className="text-gray-700 font-semibold mb-1">Confirm Password</Text>
//           <View className="flex-row items-center bg-gray-200 rounded-full px-4">
//             <TextInput
//               placeholder="••••••••"
//               placeholderTextColor="#9CA3AF"
//               secureTextEntry={confirmSecure}
//               value={form.confirmPassword}
//               onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
//               className="flex-1 py-3 text-base text-gray-900"
//             />
//             <TouchableOpacity onPress={() => setConfirmSecure(!confirmSecure)}>
//               <Ionicons
//                 name={confirmSecure ? "eye-off-outline" : "eye-outline"}
//                 size={20}
//                 color="#475569"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Terms */}
//         <Text className="text-gray-600 text-xs mt-2 text-center">
//           By continuing, you agree to{" "}
//           <Text className="font-semibold">Terms of Use</Text> and{" "}
//           <Text className="font-semibold">Privacy Policy</Text>.
//         </Text>

//         {/* Sign Up Button */}
//         <TouchableOpacity
//           disabled={loading}
//           onPress={handleRegister}
//           className="bg-black w-5/6 rounded-full py-3 mt-6 items-center"
//         >
//           <Text className="text-white font-semibold text-base">
//             {loading ? "Signing Up..." : "Sign Up"}
//           </Text>
//         </TouchableOpacity>

//         {/* Footer */}
//         <View className="flex-row mt-6">
//           <Text className="text-gray-600 text-sm">
//             Already have an account?{" "}
//           </Text>
//           <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
//             <Text className="text-orange-500 text-sm font-semibold">Log In</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }
