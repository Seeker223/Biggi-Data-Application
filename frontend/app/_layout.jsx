// app/_layout.jsx
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { Stack } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  useKeepAwake();
  return (


    <StripeProvider publishableKey=''>
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
    </StripeProvider>
  );
}


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Animated, StyleSheet, View, Text } from "react-native";
// import * as SplashScreen from "expo-splash-screen";
// import { router } from "expo-router";
// import SplashComponent from "../components/SplashComponent";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Simulate asset loading or async setup
//         await new Promise(resolve => setTimeout(resolve, 2000));

//         // Simulate fetching stored user info (replace this later)
//         const user = await fakeCheckUserSession();

//         // After everything’s ready:
//         setAppIsReady(true);

//         // Wait for fade-in animation, then navigate
//         setTimeout(() => {
//           if (user) {
//             console.log("✅ User found, going to home");
//             router.replace("/home");
//           } else {
//             console.log("🧑 No user found, going to profile");
//             router.replace("/profile");
//           }
//         }, 800);
//       } catch (e) {
//         console.error("Splash load error:", e);
//       }
//     }
//     prepare();
//   }, []);

//   useEffect(() => {
//     if (appIsReady) {
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [appIsReady]);

//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) {
//       await SplashScreen.hideAsync();
//     }
//   }, [appIsReady]);

//   if (!appIsReady) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <Animated.View
//       style={[styles.container, { opacity: fadeAnim }]}
//       onLayout={onLayoutRootView}
//     >
//       <SplashComponent />
//     </Animated.View>
//   );
// }

// // Simulated async user check
// async function fakeCheckUserSession() {
//   // e.g. you’d normally fetch this from SecureStore or AsyncStorage:
//   // return await SecureStore.getItemAsync("userToken");
//   await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
//   const loggedIn = false; // ← toggle this for testing
//   return loggedIn ? { id: 1, name: "John Doe" } : null;
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });


// import React, { useEffect, useRef } from "react";
// import { Animated, StyleSheet, View, Text, Image } from "react-native";

// import images from "../constants/images";

// export default function SplashComponent() {
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;
//   const opacityAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(opacityAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Animated.View
//         style={[
//           styles.logoContainer,
//           {
//             transform: [{ scale: scaleAnim }],
//             opacity: opacityAnim,
//           },
//         ]}
//       >
//         <Image
//           source={images.biggiData2} // 👈 replace with your logo
//           style={styles.logo}
//           resizeMode="contain"
//         />
//         <Text style={styles.title}>Biggi Data</Text>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff", // or brand color
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logoContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logo: {
//     width: 300,
//     height: 300,
//     marginBottom: 16,
//   },
//   title: {
//     marginTop:-60,
//     fontSize: 40,
//     fontWeight: "700",
//     color: "#ff8000",
//     letterSpacing: 1,
//   },
// });

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Animated, StyleSheet, View } from "react-native";
// import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import SplashComponent from "../components/SplashComponent";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const [showSplash, setShowSplash] = useState(true);
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Simulate loading (replace this with real setup later)
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } finally {
//         setAppIsReady(true);
//       }
//     }
//     prepare();
//   }, []);

//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) {
//       console.log("✅ App is ready, hiding native splash");
//       await SplashScreen.hideAsync();

//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }).start(() => {
//         console.log("✅ Custom splash finished fading out");
//         setShowSplash(false);
//       });
//     }
//   }, [appIsReady]);

//   return (
//     <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
//       {/* Your actual app screens */}
//       <Stack screenOptions={{ headerShown: false }} />

//       {/* Custom splash overlay */}
//       {showSplash && (
//         <Animated.View
//           style={[
//             StyleSheet.absoluteFill,
//             { opacity: fadeAnim, backgroundColor: "#fff" },
//           ]}
//         >
//           <SplashComponent />
//         </Animated.View>
//       )}
//     </View>
//   );
// }


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Animated, StyleSheet, View } from "react-native";
// import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import SplashComponent from "../components/SplashComponent";

// // Prevent auto-hide until we decide
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const [showSplash, setShowSplash] = useState(true);
//   const fadeAnim = useRef(new Animated.Value(1)).current; // start visible

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Simulate loading fonts, assets, etc.
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } finally {
//         setAppIsReady(true);
//       }
//     }
//     prepare();
//   }, []);

//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) {
//       await SplashScreen.hideAsync();

//       // Fade out splash, then hide it
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 600,
//         useNativeDriver: true,
//       }).start(() => setShowSplash(false));
//     }
//   }, [appIsReady]);

//   return (
//     <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
//       {/* Main app routes */}
//       <Stack
//         screenOptions={{
//           headerShown: false,
//         }}
//       />

//       {/* Splash overlay */}
//       {showSplash && (
//         <Animated.View
//           style={[
//             StyleSheet.absoluteFill,
//             { opacity: fadeAnim, backgroundColor: "#fff" },
//           ]}
//         >
//           <SplashComponent />
//         </Animated.View>
//       )}
//     </View>
//   );
// }

// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { Animated, StyleSheet, View, Text } from "react-native";
// import * as SplashScreen from "expo-splash-screen";
// import SplashComponent from "../components/SplashComponent";

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Simulate asset loading or initialization
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       } finally {
//         setAppIsReady(true);
//       }
//     }
//     prepare();
//   }, []);

//   useEffect(() => {
//     if (appIsReady) {
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [appIsReady]);

//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) {
//       await SplashScreen.hideAsync();
//     }
//   }, [appIsReady]);

//   if (!appIsReady) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <Animated.View
//       style={[styles.container, { opacity: fadeAnim }]}
//       onLayout={onLayoutRootView}
//     >
//       <SplashComponent />
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#db1111ff", justifyContent: "center", alignItems: "center" },
// });

