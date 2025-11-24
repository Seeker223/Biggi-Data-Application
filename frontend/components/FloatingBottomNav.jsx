import { View, TouchableOpacity, StyleSheet, Platform } from "react-native"; 
import { Ionicons } from "@expo/vector-icons"; import { MotiView } from "moti"; 
import { useNavigation } from "@react-navigation/native"; 

const FloatingBottomNav = () => { 

  const navigation = useNavigation(); 
  
  
  return ( 
  <View style={styles.bottomNavWrapper}> 
  <View style={styles.bottomNav}> 
    {["home", "receipt-outline", "wallet-outline", "person-outline"].
    map( (icon, index) =>
     ( 
     <MotiView key={index} from={{ scale: 1 }} 
        animate={{ scale: [1, 1.3, 1] }} 
        transition={{ loop: true, duration: 2000, delay: index * 300, }} 
        >
       <TouchableOpacity onPress={() => 
       index === 0 ? navigation.navigate("(tabs)/homeScreen") : 
       index === 1 ? navigation.navigate("(tabs)/DailyLuckyDrawScreen") : 
       index === 2 ? navigation.navigate("withdrawScreen") :
       index === 3 ? navigation.navigate("screens/DepositHistoryScreen") :
        navigation.navigate("screens/ProfileScreen") } > 
        <Ionicons name={icon} size={28} color={index === 0 ? "#FF7A00" : "#000"} /> 
        </TouchableOpacity> 
        </MotiView> ) )} 
        </View> 
        </View> 
        ); 
      }; 
      
      export default FloatingBottomNav; 

      const styles = StyleSheet.create({ 
        bottomNavWrapper: { 
          position: "absolute", 
          bottom: Platform.OS === "android" ? 25 : 35,
           width: "100%", alignItems: "center", 
          }, 
          bottomNav: { 
            flexDirection: "row", 
            justifyContent: "space-around", 
            alignItems: "center", 
            backgroundColor: "#fff", 
            borderRadius: 40, 
            paddingVertical: 12, 
            width: "88%", 
            shadowColor: "#FF7A00", 
            shadowOpacity: 0.4, 
            shadowOffset: { width: 0, height: 4 }, 
            shadowRadius: 8, 
            elevation: 15, 
          }, 
        });