import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { CardField, useStripe } from "@stripe/stripe-react-native";

const DepositScreen = () => {
  const navigation = useNavigation();
  const { user, fetchWallet } = useContext(AuthContext);
  const { confirmPayment } = useStripe();

  const [method, setMethod] = useState("online");
  const [paymentType, setPaymentType] = useState("card");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [showBanks, setShowBanks] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const banks = [
    "Access Bank",
    "Guarantee Trust Bank",
    "Wema Bank",
    "Sterling Bank",
    "First Bank",
    "Zenith Bank",
  ];

  // 🔹 Stripe Payment
  const handleStripePayment = async () => {
    if (!amount || isNaN(amount)) return alert("Enter a valid amount");
    try {
      setLoading(true);

      const res = await fetch(
        "https://biggi-data-reactnative-mern.onrender.com/api/v1/wallet/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      const { clientSecret } = await res.json();
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        alert(error.message);
      } else if (paymentIntent) {
        await fetch(
          "https://biggi-data-reactnative-mern.onrender.com/api/v1/wallet/deposit",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`,
            },
            body: JSON.stringify({
              amount,
              method: "stripe",
              reference: paymentIntent.id,
            }),
          }
        );

        await fetchWallet();
        setSuccessModal(true);
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manual Deposit
  const handleManualDeposit = async () => {
    if (!amount || !selectedBank) return alert("Enter amount & select bank");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessModal(true);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Back Button */}
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>

        {/* Toggle Tabs */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setMethod("online")}
            style={[
              styles.toggleTab,
              method === "online" && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                method === "online" && styles.activeText,
              ]}
            >
              Online
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMethod("manual")}
            style={[
              styles.toggleTab,
              method === "manual" && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                method === "manual" && styles.activeText,
              ]}
            >
              Manual
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        {method === "online" ? (
          <>
            <Text style={styles.label}>Pay with Stripe</Text>
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Payment Type Toggle */}
            <View style={styles.paymentTypeRow}>
              <TouchableOpacity
                onPress={() => setPaymentType("card")}
                style={styles.radioOption}
              >
                <View
                  style={[
                    styles.radioCircle,
                    paymentType === "card" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Card</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentType("bank")}
                style={styles.radioOption}
              >
                <View
                  style={[
                    styles.radioCircle,
                    paymentType === "bank" && styles.radioSelected,
                  ]}
                />
                <Text style={styles.radioLabel}>Bank Transfer</Text>
              </TouchableOpacity>
            </View>

            {paymentType === "card" && (
              <CardField
                postalCodeEnabled={false}
                placeholders={{ number: "4242 4242 4242 4242" }}
                cardStyle={{
                  backgroundColor: "#f0f0f0",
                  textColor: "#000",
                }}
                style={styles.cardField}
              />
            )}

            <TouchableOpacity
              disabled={loading}
              onPress={handleStripePayment}
              style={[styles.payBtn, loading && styles.disabledBtn]}
            >
              <Text style={styles.payBtnText}>
                {loading ? "Processing..." : "Pay Now"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>
              Pay with Sterling Bank:{" "}
              <Text style={styles.boldText}>0012345682</Text>
            </Text>

            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Bank Selector */}
            <TouchableOpacity
              onPress={() => setShowBanks(true)}
              style={styles.bankSelect}
            >
              <Text style={styles.bankSelectText}>
                {selectedBank || "Select Bank"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity
              disabled={loading}
              onPress={handleManualDeposit}
              style={[styles.payBtn, loading && styles.disabledBtn]}
            >
              <Text style={styles.payBtnText}>
                {loading ? "Processing..." : "Pay Now"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.feeText}>₦100 standard service charge</Text>
      </View>

      {/* Bank Modal */}
      <Modal visible={showBanks} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <FlatList
              data={banks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedBank(item);
                    setShowBanks(false);
                  }}
                  style={styles.bankItem}
                >
                  <Text style={styles.bankItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={64} color="green" />
            <Text style={styles.successTitle}>Success</Text>
            <Text style={styles.successSubtitle}>Deposit Successful</Text>

            <TouchableOpacity
              onPress={() => {
                setSuccessModal(false);
                navigation.goBack();
              }}
              style={styles.exitBtn}
            >
              <Text style={styles.exitBtnText}>Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default DepositScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  backBtn: {
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FF8000",
  },
  toggleText: {
    fontWeight: "600",
    color: "#000",
  },
  activeText: {
    color: "#fff",
  },
  label: {
    color: "#6B7280",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  paymentTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  radioSelected: {
    backgroundColor: "#FF8000",
    borderColor: "#FF8000",
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginBottom: 20,
  },
  payBtn: {
    backgroundColor: "#FF8000",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  payBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  bankSelect: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bankSelectText: {
    color: "#6B7280",
  },
  feeText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "60%",
    padding: 16,
  },
  bankItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  bankItemText: {
    color: "#000",
    fontSize: 16,
  },
  successBox: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 5,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  successSubtitle: {
    color: "#6B7280",
    marginTop: 4,
  },
  exitBtn: {
    backgroundColor: "#FF8000",
    paddingVertical: 12,
    borderRadius: 10,
    width: "75%",
    marginTop: 16,
  },
  exitBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});


// import  { useContext, useState } from "react";
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
// import { AuthContext } from "../context/AuthContext";
// import { useNavigation } from "@react-navigation/native";
// import { CardField, useStripe } from "@stripe/stripe-react-native";
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









// import React, { useState, useContext, useRef } from "react";
// import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Paystack } from "react-native-paystack-webview";
// import { AuthContext } from "../context/AuthContext";
// import Constants from "expo-constants";

// const { API_URL, PAYSTACK_PUBLIC_KEY } = Constants.expoConfig.extra;

// console.log(API_URL, PAYSTACK_PUBLIC_KEY);

// export default function DepositScreen() {
//   const [amount, setAmount] = useState("");
//   const [showPaystack, setShowPaystack] = useState(false);
//   const [successModal, setSuccessModal] = useState(false);
//   const paystackWebViewRef = useRef();

//   const { user } = useContext(AuthContext);

//   const handleDeposit = async () => {
//     if (!amount) return alert("Enter a valid amount");

//     try {
//       const response = await fetch(`${EXPO_PUBLIC_API_URL}/payment/initialize`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${user?.token}`,
//         },
//         body: JSON.stringify({
//           amount: Number(amount),
//           email: user?.email,
//         }),
//       });

//       const data = await response.json();
//       if (!data.success) throw new Error(data.message);

//       setShowPaystack(true);
//     } catch (error) {
//       console.log(error);
//       alert("Failed to initialize payment");
//     }
//   };

//   const handleVerify = async (reference) => {
//     try {
//       const res = await fetch(`${EXPO_PUBLIC_API_URL}/payment/verify?reference=${reference}`, {
//         headers: { Authorization: `Bearer ${user?.token}` },
//       });
//       const data = await res.json();
//       if (data.success) {
//         setSuccessModal(true);
//       } else {
//         alert("Verification failed");
//       }
//     } catch (err) {
//       console.log(err);
//       alert("Error verifying payment");
//     }
//   };

//   return (
//     <View className="flex-1 bg-white px-6 pt-10">
//       <TouchableOpacity onPress={() => console.log("Back")}>
//         <Ionicons name="arrow-back" size={24} color="black" />
//       </TouchableOpacity>

//       <Text className="text-lg font-bold mt-6">Deposit Funds</Text>

//       <TextInput
//         className="bg-gray-200 rounded-xl px-4 py-3 mt-4"
//         placeholder="Enter amount"
//         keyboardType="numeric"
//         value={amount}
//         onChangeText={setAmount}
//       />

//       <TouchableOpacity
//         onPress={handleDeposit}
//         className="bg-orange-500 rounded-xl py-4 mt-6"
//       >
//         <Text className="text-white text-center font-semibold">Proceed to Paystack</Text>
//       </TouchableOpacity>

//       {/* PAYSTACK MODAL */}
//       <Modal visible={showPaystack} animationType="slide">
//         <Paystack
//           paystackKey="pk_test_your_public_key"
//           amount={Number(amount)}
//           billingEmail={user?.email}
//           activityIndicatorColor="orange"
//           onCancel={() => setShowPaystack(false)}
//           onSuccess={(res) => {
//             setShowPaystack(false);
//             handleVerify(res.data.reference);
//           }}
//           autoStart={true}
//         />
//       </Modal>

//       {/* SUCCESS MODAL */}
//       <Modal visible={successModal} transparent animationType="fade">
//         <View className="flex-1 bg-black/40 justify-center items-center">
//           <View className="bg-white rounded-2xl w-80 p-6 items-center">
//             <View className="bg-green-500 w-12 h-12 rounded-full justify-center items-center mb-3">
//               <Ionicons name="checkmark" size={28} color="white" />
//             </View>
//             <Text className="text-xl font-bold mb-2">Success</Text>
//             <Text className="text-gray-500 mb-4">Deposit Successful</Text>
//             <TouchableOpacity
//               className="bg-orange-500 rounded-xl py-3 px-6"
//               onPress={() => setSuccessModal(false)}
//             >
//               <Text className="text-white font-semibold">Done</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }