import { View, Text } from 'react-native'
import React from 'react'

const DepositScreen = () => {
  return (
    <View>
      <Text>DepositScreen</Text>
    </View>
  )
}

export default DepositScreen
// import React, { useContext, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Pressable,
//   Modal,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { AuthContext } from "../../context/AuthContext";
// import { useNavigation } from "@react-navigation/native";
// import { LinearGradient } from "expo-linear-gradient";

// const DepositScreen = () => {
//   const navigation = useNavigation();
//   const { user, fetchWallet } = useContext(AuthContext);
//   const { confirmPayment } = useStripe();

//   const [method, setMethod] = useState("online"); // online | manual
//   const [paymentType, setPaymentType] = useState("card"); // card | bank
//   const [amount, setAmount] = useState("");
//   const [selectedBank, setSelectedBank] = useState("");
//   const [showBanks, setShowBanks] = useState(false);
//   const [successModal, setSuccessModal] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const banks = [
//     "Access Bank",
//     "Guarantee Trust Bank",
//     "Wema Bank",
//     "Sterling Bank",
//     "First Bank",
//     "Zenith Bank",
//   ];

//   // 🔹 Handle Stripe Payment
//   const handleStripePayment = async () => {
//     if (!amount || isNaN(amount)) return alert("Enter a valid amount");
//     try {
//       setLoading(true);

//       // Step 1: Call backend to create PaymentIntent
//       const res = await fetch(
//         "https://biggi-data-reactnative-mern.onrender.com/api/v1/wallet/create-payment-intent",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user?.token}`,
//           },
//           body: JSON.stringify({ amount }),
//         }
//       );

//       const { clientSecret } = await res.json();

//       // Step 2: Confirm payment with Stripe
//       const { error, paymentIntent } = await confirmPayment(clientSecret, {
//         paymentMethodType: "Card",
//       });

//       if (error) {
//         alert(error.message);
//       } else if (paymentIntent) {
//         // Step 3: Notify backend to update wallet
//         await fetch(
//           "https://biggi-data-reactnative-mern.onrender.com/api/v1/wallet/deposit",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${user?.token}`,
//             },
//             body: JSON.stringify({
//               amount,
//               method: "stripe",
//               reference: paymentIntent.id,
//             }),
//           }
//         );

//         await fetchWallet();
//         setSuccessModal(true);
//       }
//     } catch (err) {
//       alert("Payment failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 Handle Manual Deposit
//   const handleManualDeposit = async () => {
//     if (!amount || !selectedBank) return alert("Enter amount & select bank");
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       setSuccessModal(true);
//     }, 1500);
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       className="flex-1 bg-white"
//     >
//       <View className="px-6 pt-12">
//         {/* Back Button */}
//         <Pressable onPress={() => navigation.goBack()} className="mb-4">
//           <Ionicons name="arrow-back" size={24} color="black" />
//         </Pressable>

//         {/* Toggle Tabs */}
//         <View className="flex-row bg-gray-200 rounded-xl mb-4">
//           <TouchableOpacity
//             onPress={() => setMethod("online")}
//             className={`flex-1 py-3 rounded-xl ${
//               method === "online" ? "bg-[#FF8000]" : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-semibold ${
//                 method === "online" ? "text-white" : "text-black"
//               }`}
//             >
//               Online
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => setMethod("manual")}
//             className={`flex-1 py-3 rounded-xl ${
//               method === "manual" ? "bg-[#FF8000]" : ""
//             }`}
//           >
//             <Text
//               className={`text-center font-semibold ${
//                 method === "manual" ? "text-white" : "text-black"
//               }`}
//             >
//               Manual
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Payment Section */}
//         {method === "online" ? (
//           <>
//             <Text className="text-gray-500 mb-1">Pay with Stripe</Text>
//             <TextInput
//               placeholder="Amount"
//               value={amount}
//               onChangeText={setAmount}
//               keyboardType="numeric"
//               className="bg-gray-200 rounded-lg px-4 py-3 mb-4"
//             />

//             {/* Payment Type Toggle */}
//             <View className="flex-row items-center mb-4">
//               <TouchableOpacity
//                 onPress={() => setPaymentType("card")}
//                 className="flex-row items-center mr-4"
//               >
//                 <View
//                   className={`w-4 h-4 rounded-full border ${
//                     paymentType === "card" ? "bg-[#FF8000]" : "border-gray-400"
//                   }`}
//                 />
//                 <Text className="ml-2 text-sm">Card</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => setPaymentType("bank")}
//                 className="flex-row items-center"
//               >
//                 <View
//                   className={`w-4 h-4 rounded-full border ${
//                     paymentType === "bank" ? "bg-[#FF8000]" : "border-gray-400"
//                   }`}
//                 />
//                 <Text className="ml-2 text-sm">Bank Transfer</Text>
//               </TouchableOpacity>
//             </View>

//             {paymentType === "card" && (
//               <CardField
//                 postalCodeEnabled={false}
//                 placeholders={{ number: "4242 4242 4242 4242" }}
//                 cardStyle={{
//                   backgroundColor: "#f0f0f0",
//                   textColor: "#000000",
//                 }}
//                 style={{
//                   width: "100%",
//                   height: 50,
//                   marginBottom: 20,
//                 }}
//               />
//             )}

//             <TouchableOpacity
//               disabled={loading}
//               onPress={handleStripePayment}
//               className="bg-[#FF8000] py-4 rounded-xl mt-2"
//             >
//               <Text className="text-white text-center font-bold text-base">
//                 {loading ? "Processing..." : "Pay Now"}
//               </Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             <Text className="text-gray-500 mb-1">
//               Pay with Sterling Bank: <Text className="font-bold">0012345682</Text>
//             </Text>

//             <TextInput
//               placeholder="Amount"
//               value={amount}
//               onChangeText={setAmount}
//               keyboardType="numeric"
//               className="bg-gray-200 rounded-lg px-4 py-3 mb-4"
//             />

//             {/* Bank Selector */}
//             <TouchableOpacity
//               onPress={() => setShowBanks(true)}
//               className="bg-gray-200 rounded-lg px-4 py-3 flex-row justify-between items-center mb-4"
//             >
//               <Text className="text-gray-500">
//                 {selectedBank || "Select Bank"}
//               </Text>
//               <Ionicons name="chevron-down" size={20} color="gray" />
//             </TouchableOpacity>

//             <TouchableOpacity
//               disabled={loading}
//               onPress={handleManualDeposit}
//               className="bg-[#FF8000] py-4 rounded-xl mt-2"
//             >
//               <Text className="text-white text-center font-bold text-base">
//                 {loading ? "Processing..." : "Pay Now"}
//               </Text>
//             </TouchableOpacity>
//           </>
//         )}

//         <Text className="text-gray-400 text-sm text-center mt-2">
//           ₦100 standard service charge
//         </Text>
//       </View>

//       {/* Bank List Modal */}
//       <Modal visible={showBanks} transparent animationType="slide">
//         <View className="flex-1 bg-black/30 justify-center items-center">
//           <View className="bg-white rounded-2xl w-11/12 max-h-[60%] p-4">
//             <FlatList
//               data={banks}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   onPress={() => {
//                     setSelectedBank(item);
//                     setShowBanks(false);
//                   }}
//                   className="py-3 border-b border-gray-200"
//                 >
//                   <Text className="text-black text-base">{item}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </View>
//       </Modal>

//       {/* Success Modal */}
//       <Modal visible={successModal} transparent animationType="fade">
//         <View className="flex-1 bg-black/40 justify-center items-center">
//           <View className="bg-white w-10/12 rounded-2xl p-6 items-center shadow-lg">
//             <Ionicons name="checkmark-circle" size={64} color="green" />
//             <Text className="text-xl font-bold mt-3">Success</Text>
//             <Text className="text-gray-600 mt-1">Deposit Successful</Text>

//             <TouchableOpacity
//               onPress={() => {
//                 setSuccessModal(false);
//                 navigation.goBack();
//               }}
//               className="bg-[#FF8000] py-3 rounded-xl w-9/12 mt-4"
//             >
//               <Text className="text-white text-center font-semibold">Exit</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </KeyboardAvoidingView>
//   );
// };

// export default DepositScreen;
