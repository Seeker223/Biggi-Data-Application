import { View, Text } from 'react-native'
import React from 'react'

const _layout = () => {
  return (
    <View>
      <Text>_layout</Text>
    </View>
  )
}

export default _layout
// import { Redirect, Stack } from "expo-router";
// import { useAuth } from "../../contexts/AuthContext";
// import { Text } from "react-native";




// export default function AppLayout() {



//   const { isAuthenticated } = useAuth();
//   if (!isAuthenticated) {
//     return <Redirect href="/(auth)" />;
//   }
//   return (
//     <Text>MAIN PAGE</Text>
//   );
// }