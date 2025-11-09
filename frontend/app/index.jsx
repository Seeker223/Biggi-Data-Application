import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import React from "react";
import "../global.css";

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/splash" />;
}

// export default function Home() {
//   return (
//     <View className="flex-1 items-center justify-center bg-red-700">
//       <Text className="text-3xl font-pblack text-white">
//         Happy Coding 🚀
//       </Text>
//       <StatusBar style="light" />
//       <Link href="/profile" style={{ color: "yellow", marginTop: 16 }}>
//         Go to Profile
//       </Link>
//     </View>
//   );
// }


// import { StyleSheet, Text, View } from 'react-native'
// import { StatusBar } from 'expo-status-bar'
// import {  Link  } from 'expo-router'
// import React from 'react'           
// import '../global.css'


// const App = () => {
//   return (
//     <Stack>
//       <Stack.Screen></Stack.Screen>
//     </Stack>
//     //  <View className="flex-1 items-center justify-center bg-red-700">
//     //   <Text className="text-3xl font-pblack">HAPpY COLDINGt bbfxg</Text>
//     //   <StatusBar style="auto" />  
//     //   <Link href='/profile' style={{color: 'blue'}}>
//     //   Go to profile
//     //   </Link>
//     // </View>
//   )
// }

// export default App

