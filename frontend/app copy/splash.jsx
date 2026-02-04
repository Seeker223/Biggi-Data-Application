import React, { useEffect, useRef, useContext } from "react";
import { Animated, View, StyleSheet, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import SplashComponent from "../components/SplashComponent";
import { AuthContext } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenPage() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    const runSplash = async () => {
      // Wait for AuthContext to finish loading
      if (!loading) {
        await SplashScreen.hideAsync();

        // Fade in splash
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // After fade, navigate based on user token
          setTimeout(() => {
            if (user) {
              router.replace("/home");
            } else {
              router.replace("/launch");
            }
          }, 800);
        });
      }
    };

    runSplash();
  }, [loading, user]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SplashComponent />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
});


// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { Animated, View, StyleSheet, Text } from "react-native";
// import * as SplashScreen from "expo-splash-screen";
// import { router } from "expo-router";
// import SplashComponent from "../components/SplashComponent";

// SplashScreen.preventAutoHideAsync();

// export default function SplashScreenPage() {
//   const [appIsReady, setAppIsReady] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     async function prepare() {
//       try {
//         // Simulate loading assets or checking user session
//         await new Promise(resolve => setTimeout(resolve, 2000));
//         const user = await fakeCheckUserSession();

//         setAppIsReady(true);

//         // Animate and navigate
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 600,
//           useNativeDriver: true,
//         }).start(() => {
//           setTimeout(() => {
//             if (user) {
//               router.replace("/home");
//             } else {
//               router.replace("/profile");
//             }
//           }, 800);
//         });
//       } catch (e) {
//         console.error(e);
//       }
//     }

//     prepare();
//   }, []);

//   const onLayoutRootView = useCallback(async () => {
//     if (appIsReady) await SplashScreen.hideAsync();
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

// // Simulate async user check
// async function fakeCheckUserSession() {
//   await new Promise(resolve => setTimeout(resolve, 500));
//   const loggedIn = false; // change to true to test redirection
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
