import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";

import images from '../constants/images';

export default function LaunchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={images.biggiData2} // ← Make sure this matches your logo file
        style={[
          styles.logo,
          { width: width * 1.0, height: width * 1.0 }, // responsive logo scaling
        ]}
        resizeMode="contain"
      />

      {/* Title Section */}
      <View style={styles.textContainer}>
        <Text style={styles.brand}>Biggi Data</Text>
        <Text style={styles.title}>Biggi Reward</Text>
        <Text
          style={[
            styles.subtitle,
            isSmallScreen && { fontSize: 13, marginHorizontal: 30 },
          ]}
        >
          Buy Biggi Data, And Win Biggi Rewards
        </Text>
        <Text
          style={[
            styles.note,
            isSmallScreen && { fontSize: 12, marginTop: 4 },
          ]}
        >
          Daily, Weekly, Monthly
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "10%",
    paddingHorizontal: "8%",
  },
  logo: {
    marginBottom: "10%",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: "12%",
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F97316", // Orange accent
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A", // Deep gray
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#334155",
    textAlign: "center",
    marginBottom: 2,
  },
  note: {
    fontSize: 13,
    color: "#475569",
    fontStyle: "italic",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  loginButton: {
    backgroundColor: "#0F172A",
    width: "85%",
    paddingVertical: "3.5%",
    borderRadius: 50,
    alignItems: "center",
  },
  loginText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: "#E2E8F0",
    width: "85%",
    paddingVertical: "3.5%",
    borderRadius: 50,
    alignItems: "center",
  },
  signupText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 16,
  },
});


// import React from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";

// import images from '../constants/images';
// import { useNavigation } from "expo-router";

// export default function LaunchScreen({ navigation }) {
//   const { width } = useWindowDimensions();
//   const isSmallScreen = width < 400;
//   const navigation = useNavigation;
//   return (
//     <View style={styles.container}>
//       {/* Logo */}
//       <Image
//         source={images.biggiData2} // ← rename your image to match
//         style={[
//           styles.logo,
//           { width: width * 1.0, height: width * 1.10 }, // responsive scaling
//         ]}
//         resizeMode="contain"
//       />

//       {/* Title */}
//       <View style={styles.textContainer}>
//         <Text style={styles.brand}>Biggi Data</Text>
//         <Text style={styles.title}>Biggi Reward</Text>
//         <Text
//           style={[
//             styles.subtitle,
//             isSmallScreen && { fontSize: 13, marginHorizontal: 30 },
//           ]}
//         >
//           Buy Biggi Data, And Win Biggi Rewards
//         </Text>
//         <Text
//           style={[
//             styles.note,
//             isSmallScreen && { fontSize: 12, marginTop: 4 },
//           ]}
//         >
//           Daily, Weekly, Monthly
//         </Text>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonsContainer}>
//         <TouchableOpacity
//           style={styles.loginButton}
//           onPress={() => navigation.navigate("/(auth)/login")}
//         >
//           <Text style={styles.loginText}>Log In</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.signupButton}
//           onPress={() => navigation.navigate("Signup")}
//         >
//           <Text style={styles.signupText}>Sign Up</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: "10%",
//     paddingHorizontal: "8%",
//   },
//   logo: {
//     marginBottom: "10%",
//   },
//   textContainer: {
//     alignItems: "center",
//     marginBottom: "12%",
//   },
//   brand: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#F97316", // orange tone
//     marginBottom: 4,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "800",
//     color: "#0F172A", // deep gray
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#334155",
//     textAlign: "center",
//     marginBottom: 2,
//   },
//   note: {
//     fontSize: 13,
//     color: "#475569",
//     fontStyle: "italic",
//   },
//   buttonsContainer: {
//     width: "100%",
//     alignItems: "center",
//     gap: 12,
//   },
//   loginButton: {
//     backgroundColor: "#0F172A",
//     width: "85%",
//     paddingVertical: "3.5%",
//     borderRadius: 50,
//     alignItems: "center",
//   },
//   loginText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   signupButton: {
//     backgroundColor: "#E2E8F0",
//     width: "85%",
//     paddingVertical: "3.5%",
//     borderRadius: 50,
//     alignItems: "center",
//   },
//   signupText: {
//     color: "#0F172A",
//     fontWeight: "600",
//     fontSize: 16,
//   },
// });


