import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import CustomButton from "../../components/CustomButton";
import { AuthContext } from "../../context/AuthContext";

const GameCard = ({ iconName, title, actionText, actionColor, onPress }) => (
  <Pressable onPress={onPress} style={styles.gameCard}>
    <View style={styles.gameCardLeft}>
      <Ionicons name={iconName} size={28} color="white" />
      <Text style={styles.gameCardTitle}>{title}</Text>
    </View>
    <CustomButton
      title={actionText}
      onPress={onPress}
      bgColor={actionColor === "orange" ? "bg-[#FF8000]" : "bg-white"}
      textColor={actionColor === "orange" ? "text-white" : "text-black"}
      style={styles.gameCardButton}
    />
  </Pressable>
);

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, wallet } = useContext(AuthContext);

  const DUMMY_PROFILE_IMAGE = { uri: "https://i.pravatar.cc/150?img=6" };

  const goToDeposit = () => navigation.navigate("depositScreen");
  const goToWithdraw = () => navigation.navigate("withdrawScreen");
  const goToBundle = () => navigation.navigate("bundleScreen");
  const goToRedeem = () => navigation.navigate("redeemScreen");
  const goToNotification = () => navigation.navigate("notificationScreen");
  const goToDailyGame = () => navigation.navigate("dailyGameScreen");
  const goToWeeklyDraw = () => navigation.navigate("WeeklyDrawScreen");

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={DUMMY_PROFILE_IMAGE}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <View style={styles.userInfo}>
              <Text style={styles.username}>Hi, {user?.username || "User"}</Text>
              <Text style={styles.welcomeText}>Welcome back</Text>
            </View>
          </View>
          <Pressable onPress={goToNotification}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </Pressable>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCardContainer}>
          <LinearGradient
            colors={["#FF8000", "#FFAE00", "#FF8000"]}
            start={[0, 0]}
            end={[0, 1]}
            style={styles.walletGradient}
          >
            <View style={styles.walletRow}>
              <View>
                <Text style={styles.walletLabel}>
                  <FontAwesome5 name="wallet" size={12} color="#000" /> Main Balance
                </Text>
                <Text style={styles.walletAmount}>
                  ₦{wallet?.main ? wallet.main.toLocaleString() : "0"}
                </Text>
              </View>
              <View>
                <CustomButton
                  title="Deposit"
                  onPress={goToDeposit}
                  style={styles.walletButton}
                  bgColor="bg-black"
                  textColor="text-white"
                />
                <CustomButton
                  title="Withdraw"
                  onPress={goToWithdraw}
                  style={styles.walletButton}
                  bgColor="bg-black"
                  textColor="text-white"
                />
              </View>
            </View>

            <View style={styles.rewardRow}>
              <View>
                <Text style={styles.walletLabel}>
                  <FontAwesome5 name="trophy" size={12} color="#000" /> Reward Balance
                </Text>
                <Text style={styles.walletAmount}>
                  ₦{wallet?.reward ? wallet.reward.toLocaleString() : "0"}
                </Text>
              </View>
              <CustomButton
                title="Redeem"
                onPress={goToRedeem}
                style={styles.walletButton}
                bgColor="bg-black"
                textColor="text-white"
              />
            </View>
          </LinearGradient>
        </View>

        {/* Unlock Message */}
        <View style={styles.unlockRow}>
          <Ionicons name="checkmark-circle" size={18} color="#FF8000" />
          <Text style={styles.unlockText}>
            Buy Any Bundle → Unlock Daily & Weekly Games + Monthly Draw
          </Text>
        </View>

        {/* Main Section */}
        <View style={styles.mainSection}>
          <View style={styles.bundleRow}>
            <Pressable onPress={goToBundle} style={styles.bundleCard}>
              <Ionicons name="wifi" size={24} color="white" />
              <Text style={styles.bundleText}>Buy Data Bundle Daily</Text>
              <CustomButton
                title="Buy Now"
                onPress={goToBundle}
                style={styles.bundleButton}
                bgColor="bg-white"
                textColor="text-black"
              />
            </Pressable>

            <View style={[styles.bundleCard, styles.rightBundleCard]}>
              <Ionicons name="ticket" size={24} color="white" />
              <Text style={styles.smallBundleText}>
                Win Daily Tickets + Weekly Entry for Reward Games
              </Text>
            </View>
          </View>

          <GameCard
            iconName="game-controller-outline"
            title="Daily Number Picker Reward Game"
            actionText="Play Now"
            actionColor="orange"
            onPress={goToDailyGame}
          />

          <GameCard
            iconName="calendar-outline"
            title="Weekly Draw Check"
            actionText="Check Now"
            actionColor="orange"
            onPress={goToWeeklyDraw}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable onPress={() => navigation.navigate("HomeScreen")}>
          <View style={styles.homeIconContainer}>
            <Ionicons name="home" size={24} color="white" />
          </View>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("TransactionScreen")}>
          <View style={styles.docIconContainer}>
            <Ionicons name="document-text-outline" size={24} color="gray" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 16,
  },
  profileSection: { flexDirection: "row", alignItems: "center" },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "white",
  },
  userInfo: { marginLeft: 12 },
  username: { color: "white", fontSize: 18, fontWeight: "bold" },
  welcomeText: { color: "#9CA3AF", fontSize: 14 },
  walletCardContainer: {
    marginHorizontal: 16,
    padding: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletGradient: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  walletLabel: { color: "black", fontSize: 12, fontWeight: "600" },
  walletAmount: { color: "black", fontSize: 28, fontWeight: "bold", marginTop: 4 },
  walletButton: { marginBottom: 8, borderRadius: 50 },
  unlockRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 24, marginTop: 16 },
  unlockText: { color: "white", fontSize: 14, marginLeft: 8 },
  mainSection: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 16,
    paddingVertical: 32,
    marginTop: 24,
  },
  bundleRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  bundleCard: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 12,
    padding: 16,
    height: 160,
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightBundleCard: { marginLeft: 12 },
  bundleText: { color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" },
  smallBundleText: { color: "white", fontSize: 13, textAlign: "center" },
  bundleButton: { paddingVertical: 4, marginTop: 8 },
  gameCard: {
    width: "100%",
    backgroundColor: "black",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gameCardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  gameCardTitle: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 12 },
  gameCardButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 64,
    backgroundColor: "#E2E2E2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  homeIconContainer: { backgroundColor: "#FF8000", borderRadius: 50, padding: 8, marginHorizontal: 12 },
  docIconContainer: { backgroundColor: "white", borderRadius: 50, padding: 8 },
});


// // app/(tabs)/homeScreen.jsx

// import React, { useContext } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
// } from "react-native";
// import { FontAwesome5, Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useNavigation } from "@react-navigation/native";
// import CustomButton from "../../components/CustomButton";
// import { AuthContext } from "../../context/AuthContext";

// const GameCard = ({ iconName, title, actionText, actionColor, onPress }) => (
//   <Pressable
//     onPress={onPress}
//     className="w-full bg-black rounded-xl p-4 my-2 flex-row items-center justify-between"
//   >
//     <View className="flex-row items-center flex-1">
//       <Ionicons name={iconName} size={28} color="white" />
//       <Text className="text-white text-base font-semibold ml-3">{title}</Text>
//     </View>
//     <CustomButton
//       title={actionText}
//       onPress={onPress}
//       bgColor={actionColor === "orange" ? "bg-[#FF8000]" : "bg-white"}
//       textColor={actionColor === "orange" ? "text-white" : "text-black"}
//       className="px-4 py-2 text-sm rounded-lg"
//     />
//   </Pressable>
// );

// const HomeScreen = () => {
//   const navigation = useNavigation();
//   const { user, wallet } = useContext(AuthContext);

//   const DUMMY_PROFILE_IMAGE = { uri: "https://i.pravatar.cc/150?img=6" };

//   // Navigation Handlers
//   const goToDeposit = () => navigation.navigate("depositScreen");
//   const goToWithdraw = () => navigation.navigate("withdrawScreen");
//   const goToBundle = () => navigation.navigate("bundleScreen");
//   const goToRedeem = () => navigation.navigate("redeemScreen");
//   const goToNotification = () => navigation.navigate("notificationScreen");
//   const goToDailyGame = () => navigation.navigate("dailyGameScreen");
//   const goToWeeklyDraw = () => navigation.navigate("WeeklyDrawScreen");

//   return (
//     <View className="flex-1 bg-black">
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 100 }}
//         className="flex-1 bg-black"
//       >
//         {/* Header */}
//         <View className="flex-row items-center justify-between px-6 pt-16 pb-4">
//           <View className="flex-row items-center">
//             <Image
//               source={DUMMY_PROFILE_IMAGE}
//               className="w-12 h-12 rounded-full border-2 border-white"
//               resizeMode="cover"
//             />
//             <View className="ml-3">
//               <Text className="text-white text-lg font-bold">
//                 Hi, {user?.username || "User"}
//               </Text>
//               <Text className="text-gray-400 text-sm">Welcome back</Text>
//             </View>
//           </View>
//           <Pressable onPress={goToNotification}>
//             <Ionicons name="notifications-outline" size={24} color="white" />
//           </Pressable>
//         </View>

//         {/* Wallet Card */}
//         <View className="mx-4 p-1 rounded-xl border border-gray-800 shadow-md">
//           <LinearGradient
//             colors={["#FF8000", "#FFAE00", "#FF8000"]}
//             start={[0, 0]}
//             end={[0, 1]}
//             className="rounded-lg px-6 py-3"
//           >
//             {/* Main Wallet */}
//             <View className="flex-row justify-between items-center mb-3">
//               <View>
//                 <Text className="text-black text-sm font-semibold">
//                   <FontAwesome5 name="wallet" size={12} color="#000" /> Main Balance
//                 </Text>
//                 <Text className="text-black text-3xl font-bold mt-1">
//                   ₦{wallet?.main ? wallet.main.toLocaleString() : "0"}
//                 </Text>
//               </View>
//               <View>
//                 <CustomButton
//                   title="Deposit"
//                   onPress={goToDeposit}
//                   className="px-3 py-1 rounded-full mb-2"
//                   bgColor="bg-black"
//                   textColor="text-white"
//                 />
//                 <CustomButton
//                   title="Withdraw"
//                   onPress={goToWithdraw}
//                   className="px-3 py-1 rounded-full"
//                   bgColor="bg-black"
//                   textColor="text-white"
//                 />
//               </View>
//             </View>

//             {/* Reward Wallet */}
//             <View className="flex-row justify-between items-center pt-3 border-t border-gray-800">
//               <View>
//                 <Text className="text-black text-sm font-semibold">
//                   <FontAwesome5 name="trophy" size={12} color="#000" /> Reward Balance
//                 </Text>
//                 <Text className="text-black text-3xl font-bold mt-1">
//                   ₦{wallet?.reward ? wallet.reward.toLocaleString() : "0"}
//                 </Text>
//               </View>
//               <CustomButton
//                 title="Redeem"
//                 onPress={goToRedeem}
//                 className="px-3 py-1 rounded-full"
//                 bgColor="bg-black"
//                 textColor="text-white"
//               />
//             </View>
//           </LinearGradient>
//         </View>

//         {/* Unlock Message */}
//         <View className="flex-row items-center mx-6 mt-4">
//           <Ionicons name="checkmark-circle" size={18} color="#FF8000" />
//           <Text className="text-white text-sm ml-2">
//             Buy Any Bundle → Unlock Daily & Weekly Games + Monthly Draw
//           </Text>
//         </View>

//         {/* Main Section */}
//         <View className="flex-1 bg-white rounded-t-[40px] px-4 py-8 mt-6">
//           {/* Bundle Section */}
//           <View className="flex-row justify-between mb-6">
//             <Pressable
//               onPress={goToBundle}
//               className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-center"
//             >
//               <Ionicons name="wifi" size={24} color="white" />
//               <Text className="text-white text-base font-bold text-center">
//                 Buy Data Bundle Daily
//               </Text>
//               <CustomButton
//                 title="Buy Now"
//                 onPress={goToBundle}
//                 className="px-3 py-1 text-xs mt-2"
//                 bgColor="bg-white"
//                 textColor="text-black"
//               />
//             </Pressable>

//             <View className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-center ml-3">
//               <Ionicons name="ticket" size={24} color="white" />
//               <Text className="text-white text-sm text-center">
//                 Win Daily Tickets + Weekly Entry for Reward Games
//               </Text>
//             </View>
//           </View>

//           {/* Games Section */}
//           <GameCard
//             iconName="game-controller-outline"
//             title="Daily Number Picker Reward Game"
//             actionText="Play Now"
//             actionColor="orange"
//             onPress={goToDailyGame}
//           />

//           <GameCard
//             iconName="calendar-outline"
//             title="Weekly Draw Check"
//             actionText="Check Now"
//             actionColor="orange"
//             onPress={goToWeeklyDraw}
//           />
//         </View>
//       </ScrollView>

//       {/* Bottom Navigation */}
//       <View className="absolute bottom-0 w-full h-16 bg-[#E2E2E2] flex-row justify-center items-center rounded-t-3xl border-t border-gray-200">
//   <Pressable  onPress={() => navigation.navigate("HomeScreen")}>
//     <View className=" bg-[#FF8000] rounded-full p-2">
//       <Ionicons name="home" size={24} color="white" />
//     </View>
//   </Pressable>

//   <Pressable onPress={() => navigation.navigate("TransactionScreen")}>
//     <View className="bg-white rounded-full p-2">
//       <Ionicons name="document-text-outline" size={24} color="gray" />
//     </View>
//   </Pressable>
// </View>
//     </View>
//   );
// };

// export default HomeScreen;

// // app/(tabs)/homeScreen.jsx
// // app/(tabs)/homeScreen.jsx

// import React, { useContext } from "react";
// import {
//   View,
//   Text,
//   Image,
//   Pressable,
//   ScrollView,
//   Alert,
// } from "react-native";
// import {
//   FontAwesome5,
//   Ionicons,
// } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import CustomButton from "../../components/CustomButton";
// import { AuthContext } from "../../context/AuthContext";

// import { useNavigation } from "@react-navigation/native";



// const GameCard = ({ iconName, title, actionText, actionColor, onPress }) => (
//   <Pressable
//     onPress={onPress}
//     className="w-full bg-black rounded-xl p-4 my-2 flex-row items-center justify-between"
//   >
//     <View className="flex-row items-center flex-1">
//       <Ionicons name={iconName} size={28} color="white" className="mr-3" />
//       <Text className="text-white text-base font-semibold ml-3">{title}</Text>
//     </View>
//     <CustomButton
//       title={actionText}
//       onPress={onPress}
//       bgColor={actionColor === "orange" ? "bg-[#FF8000]" : "bg-white"}
//       textColor={actionColor === "orange" ? "text-white" : "text-black"}
//       className="px-4 py-2 text-sm rounded-lg"
//     />
//   </Pressable>
// );

// const HomeScreen = ({ navigation }) => {
//   const { user, wallet, deposit, withdraw, redeemReward } =
//     useContext(AuthContext);


//   const DUMMY_PROFILE_IMAGE = { uri: "https://i.pravatar.cc/150?img=6" };

// const goToDeposit = () => {
//   const navigation = useNavigation();
//     // Navigate to the screen named 'DepositScreen' (ensure this name matches your navigator setup)
//     navigation.navigate('DepositScreen'); 
//   };
  
//   const goToWithdraw = () => {
//     const navigation = useNavigation();
//     navigation.navigate('WithdrawScreen');
//   };

//   const goToBundle = () => {
//     const navigation = useNavigation();
//     navigation.navigate('bundleScreen');
//   };
//   const goToRedeem = () => {
//     const navigation = useNavigation();
//     navigation.navigate('redeemScreen');
//   };
//   const goToNotification = () => {
//     const navigation = useNavigation();
//     navigation.navigate('notificationScreen');
//   };


//   return (
//     <View className="flex-1 bg-black">
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 100 }}
//         className="flex-1 bg-black"
//       >
//         {/* 1️⃣ Header */}
//         <View className="flex-row items-center justify-between px-6 pt-16 pb-4 bg-black">
//           <View className="flex-row items-center">
//             <Image
//               source={DUMMY_PROFILE_IMAGE}
//               className="w-12 h-12 rounded-full border-2 border-white"
//               resizeMode="cover"
//             />
//             <View className="ml-3">
//               <Text className="text-white text-lg font-bold">
//                 Hi, {user?.username || "User"}
//               </Text>
//               <Text className="text-gray-400 text-sm">Welcome back</Text>
//             </View>
//           </View>
//           <Pressable onPress={goToNotification}>
//             <Ionicons name="notifications-outline" size={24} color="white" />
//           </Pressable>
//         </View>

//         {/* 2️⃣ Wallet Card */}
//         <View className="mx-4 p-1 rounded-xl shadow-lg border border-gray-800">
//           <LinearGradient
//             colors={["#FF8000", "#FFAE00", "#FF8000"]}
//             start={[0, 0]}
//             end={[0, 1]}
//             className="w-full rounded-lg px-6 py-3"
//             style={{ borderRadius: 17 }}
//           >
//             {/* Main Wallet */}
//             <View className="flex-row justify-between items-center mb-3">
//               <View className="flex-col">
//                 <Text className="text-black text-sm font-semibold flex-row items-center">
//                   <FontAwesome5
//                     name="wallet"
//                     size={12}
//                     color="#000000"
//                     className="mr-2"
//                   />
//                   <Text className="ml-2 text-black">Main Balance</Text>
//                 </Text>
//                 <Text className="text-[#000000] text-3xl font-bold mt-1">
//                   ₦
//                   {wallet?.main
//                     ? wallet.main.toLocaleString()
//                     : "0"}
//                 </Text>
//               </View>

//               <View className="flex-col space-y-2">
//                 <CustomButton
//                   title="Deposit"
//                   onPress={goToDeposit}
//                   className="px-3 py-1 rounded-full mb-1"
//                   bgColor="bg-black"
//                   textColor="text-white"
//                   activeBgColor="bg-gray-800"
//                 />
//                 <CustomButton
//                   title="Withdraw"
//                   onPress={goToWithdraw}
//                   className="bg-black px-3 py-1 rounded-full"
//                   bgColor="bg-black"
//                   textColor="text-white"
//                   activeBgColor="bg-gray-800"
//                 />
//               </View>
//             </View>

//             {/* Reward Wallet */}
//             <View className="flex-row justify-between items-center pt-3 border-t border-gray-800">
//               <View className="flex-col">
//                 <Text className="text-black text-sm font-semibold flex-row items-center">
//                   <FontAwesome5
//                     name="trophy"
//                     size={12}
//                     color="#000000"
//                     className="mr-2"
//                   />
//                   <Text className="ml-2 text-black">Reward Balance</Text>
//                 </Text>
//                 <Text className="text-[#000000] text-3xl font-bold mt-1">
//                   ₦
//                   {wallet?.reward
//                     ? wallet.reward.toLocaleString()
//                     : "0"}
//                 </Text>
//               </View>
//               <CustomButton
//                 title="Redeem"
//                 onPress={goToRedeem}
//                 className="bg-[#000000] px-3 py-1 rounded-full"
//                 bgColor="bg-[#000000]"
//                 textColor="text-white"
//                 activeBgColor="bg-[#E67300]"
//               />
//             </View>
//           </LinearGradient>
//         </View>

//         {/* Unlock Message */}
//         <View className="flex-row items-center mx-6 mt-4">
//           <Ionicons name="checkmark-circle" size={18} color="#FF8000" />
//           <Text className="text-white text-sm ml-2">
//             Buy Any Bundle → Unlock Daily & Weekly Games + Monthly Draw
//           </Text>
//         </View>

//         {/* 3️⃣ Main Section */}
//         <View className="flex-1 bg-white rounded-t-[40px] px-4 py-8 mt-6">
//           <View className="flex-row justify-between space-x-3 mb-6">
//             <Pressable
//               onPress={goToBundle}
//               className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-center"
//             >
//               <Ionicons name="wifi" size={24} color="white" />
//               <Text className="text-white text-base font-bold text-center">
//                 Buy Data Bundle Daily
//               </Text>
//               <CustomButton
//                 title="Buy Now"
//                 onPress={goToBundle}
//                 className="px-3 py-1 text-xs mt-2"
//                 bgColor="bg-white"
//                 textColor="text-black"
//                 activeBgColor="bg-[#E67300]"
//               />
//             </Pressable>

//             <View className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-center ml-1">
//               <Ionicons name="ticket" size={24} color="white" />
//               <Text className="text-white text-sm text-center">
//                 Win Daily Tickets + Weekly Entry for Reward Games
//               </Text>
//             </View>
//           </View>

//           {/* Games */}
//           <GameCard
//             iconName="game-controller-outline"
//             title="Daily Number Picker Reward Game"
//             actionText="Play Now"
//             actionColor="orange"
//             onPress={() => handleAction("Number Picker")}
//           />
//           {/* <GameCard
//             iconName="football-outline"
//             title="Weekly Premier League Predict and Win Reward Game"
//             actionText="Play Now"
//             actionColor="orange"
//             onPress={() => handleAction("League Predict")}
//           /> */}
//           <GameCard
//             iconName="calendar-outline"
//             title="Weekly Draw Check"
//             actionText="Check Now"
//             actionColor="orange"
//             onPress={() => handleAction("Monthly Draw")}
//           />
//         </View>
//       </ScrollView>

//       {/* Bottom Nav */}
//       <View className="absolute bottom-0 w-full h-16 bg-[#E2E2E2] flex-row justify-around items-center rounded-t-3xl border-t border-gray-200">
//         <View className="flex-row w-full justify-around">
//           <Ionicons
//             className="bg-[#FF8000] rounded-full mr-5 px-2 py-2"
//             name="home"
//             size={24}
//             color="white"
//           />
//           <Ionicons
//             className="font-bold bg-white border rounded-full px-2 py-2"
//             name="document-text-outline"
//             size={24}
//             color="gray"
//           />
//         </View>
//       </View>
//     </View>
//   );
// };

// export default HomeScreen;

// import React from 'react';
// import { View, Text, Image, Pressable, ScrollView, Alert } from 'react-native';
// import { Feather, FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// // Assuming CustomButton is in '../../components/CustomButton'
// import CustomButton from '../components/CustomButton'; 

// // Component for a single reward/game card
// const GameCard = ({ iconName, title, actionText, actionColor, onPress }) => (
//     <Pressable
//         onPress={onPress}
//         className="w-full bg-black rounded-xl p-4 my-2 flex-row items-center justify-between"
//     >
//         <View className="flex-row items-center flex-1">
//             <Ionicons name={iconName} size={28} color="white" className="mr-3" />
//             <Text className="text-white text-base font-semibold ml-3">{title}</Text>
//         </View>
//         <CustomButton
//             title={actionText}
//             onPress={onPress}
//             // Use props to define button color for the specific action
//             bgColor={actionColor === 'orange' ? "bg-[#FF8000]" : "bg-white"}
//             textColor={actionColor === 'orange' ? "text-white" : "text-black"}
//             className="px-4 py-2 text-sm rounded-lg"
//         />
//     </Pressable>
// );

// const HomeScreen = ({ navigation }) => {
//     // Dummy profile image (replace with your actual image source)
//     const DUMMY_PROFILE_IMAGE = { uri: 'https://i.pravatar.cc/150?img=6' }; 
//     const handleAction = (action) => Alert.alert('Action', `Tapped ${action}`);

//     return (
//         <View className="flex-1 bg-black">
//             {/* ScrollView to ensure the content is scrollable */}
//             <ScrollView 
//                 contentContainerStyle={{ paddingBottom: 100 }} 
//                 className="flex-1 bg-black"
//             >
//                 {/* 1. Top Header (Profile and Notification) */}
//                 <View className="flex-row items-center justify-between px-6 pt-16 pb-4 bg-black">
//                     <View className="flex-row items-center">
//                         <Image
//                             source={DUMMY_PROFILE_IMAGE}
//                             className="w-12 h-12 rounded-full border-2 border-white"
//                             resizeMode="cover"
//                         />
//                         <View className="ml-3">
//                             <Text className="text-white text-lg font-bold">Hi, Jason</Text>
//                             <Text className="text-gray-400 text-sm">Welcome back</Text>
//                         </View>
//                     </View>
//                     <Pressable onPress={() => handleAction('Notifications')}>
//                         <Ionicons name="notifications-outline" size={24} color="white" />
//                     </Pressable>
//                 </View>

//                 {/* 2. Balance Card (Floating/Centered Content) */}
//                 <View className="bg-black mx-4 mt-4 p-5 rounded-xl shadow-lg border border-gray-800">
//                     <View className="flex-row justify-between items-center mb-3">
//                         <View className="flex-col">
//                             <Text className="text-white text-sm font-semibold flex-row items-center">
//                                 <FontAwesome5 name="wallet" size={12} color="#FF8000" className="mr-2" />
//                                 <Text className="ml-2">Main Balance</Text>
//                             </Text>
//                             <Text className="text-[#FF8000] text-3xl font-bold mt-1">N20,000</Text>
//                         </View>
//                         <View className="flex-col space-y-2">
//                             <CustomButton 
//                                 title="Deposit" 
//                                 onPress={() => handleAction('Deposit')} 
//                                 className="bg-white border border-white px-3 py-1 rounded-full"
//                                 bgColor="bg-black"
//                                 textColor="text-white"
//                                 activeBgColor="bg-gray-800"
//                             />
//                             <CustomButton 
//                                 title="Withdraw" 
//                                 onPress={() => handleAction('Withdraw')} 
//                                 className="bg-white border border-white px-3 py-1 rounded-full"
//                                 bgColor="bg-black"
//                                 textColor="text-white"
//                                 activeBgColor="bg-gray-800"
//                             />
//                         </View>
//                     </View>
                    
//                     <View className="flex-row justify-between items-center pt-3 border-t border-gray-800">
//                         <View className="flex-col">
//                             <Text className="text-white text-sm font-semibold flex-row items-center">
//                                 <FontAwesome5 name="trophy" size={12} color="#FF8000" className="mr-2" />
//                                 <Text className="ml-2">Reward Balance</Text>
//                             </Text>
//                             <Text className="text-[#FF8000] text-3xl font-bold mt-1">N50,000</Text>
//                         </View>
//                         <CustomButton 
//                             title="Redeem" 
//                             onPress={() => handleAction('Redeem')} 
//                             className="bg-[#FF8000] px-3 py-1 rounded-full"
//                             bgColor="bg-[#FF8000]"
//                             textColor="text-white"
//                             activeBgColor="bg-[#E67300]"
//                         />
//                     </View>
//                 </View>

//                 {/* Unlock Games Prompt */}
//                 <View className="flex-row items-center mx-6 mt-4">
//                     <Ionicons name="checkmark-circle" size={18} color="#FF8000" />
//                     <Text className="text-white text-sm ml-2">
//                         Buy Any Bundle → Unlock Daily & Weekly Games + Monthly Draw
//                     </Text>
//                 </View>

//                 {/* 3. Main Content Area (Light Card) */}
//                 <View className="flex-1 bg-white rounded-t-[40px] px-4 py-8 mt-6">
                    
//                     {/* Dual Action Cards (Buy Bundle & Win Tickets) */}
//                     <View className="flex-row justify-between space-x-3 mb-6">
//                         {/* Card 1: Buy Data Bundle */}
//                         <Pressable 
//                             onPress={() => handleAction('Buy Bundle')}
//                             className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-start"
//                         >
//                             <Ionicons name="wifi" size={24} color="white" />
//                             <View>
//                                 <Text className="text-white text-base font-bold">Buy Data</Text>
//                                 <Text className="text-white text-base font-bold">Bundle Daily</Text>
//                                 <CustomButton title="Buy Now" onPress={() => handleAction('Buy Bundle')} 
//                                     className="px-3 py-1 text-xs mt-2" 
//                                     bgColor="bg-[#FF8000]" textColor="text-white" activeBgColor="bg-[#E67300]"
//                                 />
//                             </View>
//                         </Pressable>
                        
//                         {/* Card 2: Win Tickets */}
//                         <View className="flex-1 bg-black rounded-xl p-4 h-40 justify-between items-start">
//                             <Ionicons name="ticket" size={24} color="white" />
//                             <Text className="text-white text-sm">
//                                 Win Daily Tickets + One-Time Weekly Ticket To Participate In Our Reward Games
//                             </Text>
//                         </View>
//                     </View>

//                     {/* Vertical List of Game Cards */}
//                     <GameCard 
//                         iconName="game-controller-outline"
//                         title="Daily Number Picker Reward Game"
//                         actionText="Play Now"
//                         actionColor="orange"
//                         onPress={() => handleAction('Number Picker')}
//                     />
//                     <GameCard 
//                         iconName="football-outline"
//                         title="Weekly Premier League Predict and Win Reward Game"
//                         actionText="Play Now"
//                         actionColor="orange"
//                         onPress={() => handleAction('League Predict')}
//                     />
//                     <GameCard 
//                         iconName="calendar-outline"
//                         title="Monthly Draw Check"
//                         actionText="Check Now"
//                         actionColor="orange"
//                         onPress={() => handleAction('Monthly Draw')}
//                     />
                    
//                 </View>
//             </ScrollView>
            
//             {/* Note: Bottom Nav should be outside the ScrollView in a real app, 
//                but for component clarity, I'm keeping it simple here. */}
//             <View className="absolute bottom-0 w-full h-16 bg-white flex-row justify-around items-center rounded-t-3xl border-t border-gray-200">
//                 <View className="bg-[#FF8000] p-3 rounded-xl">
//                     <Ionicons name="home" size={24} color="white" />
//                 </View>
//                 <Ionicons name="document-text-outline" size={24} color="gray" />
//             </View>
//         </View>
//     );
// };

// export default HomeScreen;