// // frontend/app/withdrawScreen.jsx - FINAL VERSION WITH FLUTTERWAVE
// import React, { useState, useContext, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Platform,
//   Animated,
//   Modal,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   FlatList,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { AuthContext } from "../context/AuthContext";
// import api from "../utils/api";

// const WITHDRAWAL_CHARGE = 0;
// const MIN_WITHDRAWAL = 100;
// const MAX_WITHDRAWAL = 1000000;

// // Biggi Data Brand Colors
// const BRAND_COLORS = {
//   primary: "#FF7A00", // Orange
//   primaryDark: "#E56A00", // Darker orange
//   secondary: "#000000", // Black
//   background: "#FFFFFF", // White
//   cardBg: "#F8F9FA", // Light gray
//   textPrimary: "#000000", // Black
//   textSecondary: "#666666", // Gray
//   success: "#28A745", // Green
//   error: "#DC3545", // Red
//   warning: "#FFC107", // Yellow
//   info: "#17A2B8", // Teal
// };

// // Nigerian banks with codes (required for Flutterwave) - SORTED ALPHABETICALLY
// // UPDATED: Changed OPay code from "OPAY" to "099" (Flutterwave's code)
// const banks = [
//   { name: "Access Bank", code: "044" },
//   { name: "Ecobank Nigeria", code: "050" },
//   { name: "Fidelity Bank", code: "070" },
//   { name: "First Bank", code: "011" },
//   { name: "First City Monument Bank (FCMB)", code: "214" },
//   { name: "Guarantee Trust Bank (GTB)", code: "058" },
//   { name: "Heritage Bank", code: "030" },
//   { name: "Jaiz Bank", code: "301" },
//   { name: "Keystone Bank", code: "082" },
//   { name: "Kuda Bank", code: "50211" },
//   { name: "Moniepoint", code: "50515" },
//   { name: "Opay", code: "099" }, // UPDATED: Changed from "OPAY" to "099" (Flutterwave's code)
//   { name: "Palmpay", code: "100" }, // UPDATED: Changed from "PALMPAY" to "100"
//   { name: "Polaris Bank", code: "076" },
//   { name: "Providus Bank", code: "101" },
//   { name: "Stanbic IBTC Bank", code: "221" },
//   { name: "Standard Chartered Bank", code: "068" },
//   { name: "Sterling Bank", code: "232" },
//   { name: "Suntrust Bank", code: "100" },
//   { name: "Titan Trust Bank", code: "102" },
//   { name: "Union Bank", code: "032" },
//   { name: "United Bank for Africa (UBA)", code: "033" },
//   { name: "Unity Bank", code: "215" },
//   { name: "Wema Bank", code: "035" },
//   { name: "Zenith Bank", code: "057" },
// ];

// const WithdrawScreen = ({ navigation }) => {
//   const { user, refreshUser } = useContext(AuthContext);

//   const [amount, setAmount] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [accountName, setAccountName] = useState("");
//   const [selectedBank, setSelectedBank] = useState(null);
//   const [showBankList, setShowBankList] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
  
//   // Filter banks based on search
//   const filteredBanks = banks.filter(bank =>
//     bank.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   /* ---------------- TOAST ---------------- */
//   const toastAnim = useRef(new Animated.Value(-100)).current;
//   const [toastVisible, setToastVisible] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [toastType, setToastType] = useState("info");

//   const showToast = (msg, type = "info") => {
//     setToastMessage(msg);
//     setToastType(type);
//     setToastVisible(true);

//     Animated.timing(toastAnim, {
//       toValue: 20,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();

//     setTimeout(() => {
//       Animated.timing(toastAnim, {
//         toValue: -100,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setToastVisible(false));
//     }, 3500);
//   };

//   /* ---------------- VALIDATE ACCOUNT NUMBER ---------------- */
//   const validateAccountNumber = async () => {
//     if (!selectedBank || !accountNumber || accountNumber.length < 10) {
//       showToast("Please select a bank and enter a valid account number", "error");
//       return false;
//     }

//     try {
//       setIsProcessing(true);
      
//       // Special handling for OPay verification
//       const bankCode = selectedBank.code;
//       let payload = {
//         account_number: accountNumber,
//         bank_code: bankCode,
//       };

//       // If it's OPay, add a flag for backend handling
//       if (selectedBank.name.toLowerCase().includes("opay")) {
//         payload.is_fintech = true;
//         payload.bank_name = "Opay";
//       }

//       const res = await api.post("/wallet/verify-account", payload);

//       if (res.data?.success) {
//         setAccountName(res.data.account_name);
//         showToast("Account verified successfully", "success");
//         return true;
//       } else {
//         showToast(res.data?.message || "Account verification failed", "error");
//         return false;
//       }
//     } catch (error) {
//       console.log("Account verification error:", error);
      
//       // Special error handling for OPay
//       if (selectedBank?.name.toLowerCase().includes("opay")) {
//         showToast(
//           "OPay account verification might take longer. Please ensure account details are correct.",
//           "warning"
//         );
//         // Allow proceeding with manual account name entry for OPay
//         if (!accountName) {
//           setAccountName("OPay Account Holder");
//         }
//         return true; // Allow proceeding for OPay
//       } else {
//         showToast(
//           error.response?.data?.message || 
//           "Account verification failed. Please check details.", 
//           "error"
//         );
//         return false;
//       }
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   /* ---------------- AMOUNT VALIDATION ---------------- */
//   const enteredAmount = Number(amount) > 0 ? Number(amount) : 0;
//   const totalAmount = enteredAmount + WITHDRAWAL_CHARGE;
//   const isValidAmount = () => enteredAmount >= MIN_WITHDRAWAL && enteredAmount <= MAX_WITHDRAWAL;

//   /* ---------------- VALIDATE FORM ---------------- */
//   const validateForm = () => {
//     if (!isValidAmount()) {
//       if (enteredAmount < MIN_WITHDRAWAL) {
//         showToast(`Minimum withdrawal is ₦${MIN_WITHDRAWAL}`, "error");
//       } else if (enteredAmount > MAX_WITHDRAWAL) {
//         showToast(`Maximum withdrawal is ₦${MAX_WITHDRAWAL.toLocaleString()}`, "error");
//       }
//       return false;
//     }

//     if (!accountNumber || accountNumber.length < 10) {
//       showToast("Please enter a valid 10-digit account number", "error");
//       return false;
//     }

//     if (!selectedBank) {
//       showToast("Please select a bank", "error");
//       return false;
//     }

//     // Special handling for OPay - allow manual account name
//     if (selectedBank.name.toLowerCase().includes("opay")) {
//       if (!accountName || accountName.trim().length < 2) {
//         // For OPay, we can proceed with a default name or ask user to enter
//         if (!accountName) {
//           setAccountName("OPay Account Holder");
//         }
//       }
//     } else if (!accountName || accountName.trim().length < 2) {
//       showToast("Please verify account name", "error");
//       return false;
//     }

//     if (enteredAmount > (user?.mainBalance || 0)) {
//       showToast("Insufficient balance", "error");
//       return false;
//     }

//     return true;
//   };

//   /* ---------------- START WITHDRAWAL ---------------- */
//   const handleStartWithdrawal = async () => {
//     if (isProcessing) {
//       showToast("Please wait for current transaction to complete", "info");
//       return;
//     }

//     if (!validateForm()) return;

//     setShowConfirm(true);
//   };

//   /* ---------------- PROCESS WITHDRAWAL VIA FLUTTERWAVE ---------------- */
//   const processFlutterwaveWithdrawal = async () => {
//     setIsProcessing(true);
//     setShowConfirm(false);

//     try {
//       // Generate Flutterwave transaction reference
//       const reference = `flw_withdraw_${user._id}_${Date.now()}`;
      
//       // Call backend endpoint that initiates Flutterwave transfer
//       const payload = {
//         tx_ref: reference,
//         amount: enteredAmount,
//         account_bank: selectedBank.code,
//         account_number: accountNumber,
//         beneficiary_name: accountName.trim(),
//         narration: `Withdrawal from Biggi Data`,
//         currency: "NGN",
//       };

//       const res = await api.post("/wallet/flutterwave-withdraw", payload);

//       if (res.data?.success) {
//         // Refresh user balance
//         await refreshUser();
        
//         showToast("Withdrawal initiated successfully! 🎉", "success");
        
//         // Reset form
//         setAmount("");
//         setAccountNumber("");
//         setAccountName("");
//         setSelectedBank(null);
//       } else {
//         showToast(res.data?.message || "Withdrawal failed", "error");
//       }
//     } catch (error) {
//       console.log("Flutterwave withdrawal error:", error);
//       showToast(
//         error.response?.data?.message ||
//         "Failed to process withdrawal. Please try again.",
//         "error"
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   /* ---------------- RENDER BANK DROPDOWN ---------------- */
//   const renderBankDropdown = () => (
//     <>
//       <TouchableOpacity
//         style={styles.input}
//         onPress={() => setShowBankList(!showBankList)}
//         disabled={isProcessing}
//       >
//         <Text style={[styles.inputText, !selectedBank && styles.placeholder]}>
//           {selectedBank ? selectedBank.name : "Select bank..."}
//         </Text>
//         <Ionicons 
//           name={showBankList ? "chevron-up" : "chevron-down"} 
//           size={20} 
//           color={BRAND_COLORS.textSecondary} 
//         />
//       </TouchableOpacity>

//       {showBankList && (
//         <Modal
//           transparent={true}
//           visible={showBankList}
//           animationType="slide"
//           onRequestClose={() => setShowBankList(false)}
//         >
//           <View style={styles.modalBackdrop}>
//             <View style={styles.bankModalContent}>
//               <View style={styles.bankModalHeader}>
//                 <Text style={styles.bankModalTitle}>Select Bank</Text>
//                 <TouchableOpacity 
//                   style={styles.closeButton}
//                   onPress={() => setShowBankList(false)}
//                 >
//                   <Ionicons name="close" size={24} color={BRAND_COLORS.textPrimary} />
//                 </TouchableOpacity>
//               </View>
              
//               {/* Search Input */}
//               <View style={styles.searchContainer}>
//                 <Ionicons name="search" size={20} color={BRAND_COLORS.textSecondary} />
//                 <TextInput
//                   style={styles.searchInput}
//                   placeholder="Search bank..."
//                   placeholderTextColor={BRAND_COLORS.textSecondary}
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                   autoFocus={true}
//                 />
//                 {searchQuery.length > 0 && (
//                   <TouchableOpacity onPress={() => setSearchQuery("")}>
//                     <Ionicons name="close-circle" size={20} color={BRAND_COLORS.textSecondary} />
//                   </TouchableOpacity>
//                 )}
//               </View>
              
//               {/* Scrollable Bank List */}
//               <FlatList
//                 data={filteredBanks}
//                 keyExtractor={(item, index) => `${item.code}-${index}`}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={[
//                       styles.bankItem,
//                       selectedBank?.code === item.code && styles.bankItemSelected
//                     ]}
//                     onPress={() => {
//                       setSelectedBank(item);
//                       setShowBankList(false);
//                       setSearchQuery("");
//                       // Clear account name when bank changes
//                       setAccountName("");
//                     }}
//                   >
//                     <View style={styles.bankItemContent}>
//                       <View style={styles.bankIconContainer}>
//                         <Ionicons 
//                           name="business-outline" 
//                           size={22} 
//                           color={selectedBank?.code === item.code ? BRAND_COLORS.primary : BRAND_COLORS.textSecondary} 
//                         />
//                       </View>
//                       <Text style={[
//                         styles.bankName,
//                         selectedBank?.code === item.code && styles.bankNameSelected
//                       ]}>
//                         {item.name}
//                       </Text>
//                     </View>
//                     {selectedBank?.code === item.code && (
//                       <Ionicons name="checkmark-circle" size={22} color={BRAND_COLORS.primary} />
//                     )}
//                   </TouchableOpacity>
//                 )}
//                 ItemSeparatorComponent={() => <View style={styles.separator} />}
//                 ListEmptyComponent={
//                   <View style={styles.emptyContainer}>
//                     <Ionicons name="alert-circle-outline" size={40} color={BRAND_COLORS.textSecondary} />
//                     <Text style={styles.emptyText}>No banks found</Text>
//                   </View>
//                 }
//                 contentContainerStyle={styles.bankListContent}
//                 showsVerticalScrollIndicator={true}
//               />
              
//               {/* Popular Banks Section */}
//               <View style={styles.popularSection}>
//                 <Text style={styles.popularTitle}>Popular Banks</Text>
//                 <ScrollView 
//                   horizontal 
//                   showsHorizontalScrollIndicator={false}
//                   style={styles.popularScroll}
//                   contentContainerStyle={styles.popularScrollContent}
//                 >
//                   {["Opay", "GTB", "UBA", "First Bank", "Zenith", "Access"].map((bankName, index) => {
//                     const popularBank = banks.find(b => b.name.includes(bankName));
//                     if (!popularBank) return null;
                    
//                     return (
//                       <TouchableOpacity
//                         key={index}
//                         style={styles.popularChip}
//                         onPress={() => {
//                           setSelectedBank(popularBank);
//                           setShowBankList(false);
//                           setSearchQuery("");
//                           setAccountName("");
//                         }}
//                       >
//                         <Text style={styles.popularChipText}>{bankName}</Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </ScrollView>
//               </View>
//             </View>
//           </View>
//         </Modal>
//       )}
//     </>
//   );

//   /* ---------------- VERIFY ACCOUNT BUTTON ---------------- */
//   const renderVerifyButton = () => {
//     if (!selectedBank || !accountNumber || accountNumber.length < 10 || isProcessing) {
//       return null;
//     }

//     return (
//       <TouchableOpacity
//         style={styles.verifyButton}
//         onPress={validateAccountNumber}
//         disabled={isProcessing}
//       >
//         <Ionicons name="checkmark-circle-outline" size={16} color={BRAND_COLORS.primary} />
//         <Text style={styles.verifyText}>Verify Account</Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {toastVisible && (
//         <Animated.View
//           style={[
//             styles.toast,
//             {
//               transform: [{ translateY: toastAnim }],
//               backgroundColor:
//                 toastType === "error"
//                   ? BRAND_COLORS.error
//                   : toastType === "success"
//                   ? BRAND_COLORS.success
//                   : BRAND_COLORS.secondary,
//             },
//           ]}
//         >
//           <Text style={styles.toastText}>{toastMessage}</Text>
//         </Animated.View>
//       )}

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => {
//             if (isProcessing) {
//               Alert.alert(
//                 "Transaction in Progress",
//                 "A withdrawal is being processed. Are you sure you want to leave?",
//                 [
//                   { text: "Stay", style: "cancel" },
//                   { text: "Leave", onPress: () => navigation.goBack() },
//                 ]
//               );
//             } else {
//               navigation.goBack();
//             }
//           }}
//         >
//           <Ionicons name="chevron-back" size={26} color={BRAND_COLORS.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Withdraw Funds</Text>
//         <View style={{ width: 26 }} />
//       </View>

//       {/* CONTENT */}
//       <ScrollView 
//         style={styles.content}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.contentContainer}
//       >
//         {/* BALANCE DISPLAY */}
//         <View style={styles.balanceCard}>
//           <View style={styles.balanceRow}>
//             <View>
//               <Text style={styles.balanceLabel}>Available Balance</Text>
//               <Text style={styles.balanceAmount}>
//                 ₦{(user?.mainBalance || 0).toLocaleString()}
//               </Text>
//             </View>
//             <Ionicons name="wallet-outline" size={32} color={BRAND_COLORS.primary} />
//           </View>
//           <View style={styles.balanceDivider} />
//           <View style={styles.balanceInfo}>
//             <Ionicons name="information-circle" size={16} color={BRAND_COLORS.textSecondary} />
//             <Text style={styles.balanceInfoText}>
//               Min: ₦{MIN_WITHDRAWAL} • Max: ₦{MAX_WITHDRAWAL.toLocaleString()}
//             </Text>
//           </View>
//         </View>

//         {/* FLUTTERWAVE LOGO */}
//         <View style={styles.flutterwaveBadge}>
//           <View style={styles.flutterwaveLogo}>
//             <Ionicons name="flash" size={20} color="#F5A623" />
//             <Text style={styles.flutterwaveText}>Flutterwave</Text>
//           </View>
//           <Text style={styles.flutterwaveSubtext}>Secure Payouts</Text>
//         </View>

//         {/* INPUT FIELDS */}
//         <View style={styles.formSection}>
//           <Text style={styles.sectionTitle}>Withdrawal Details</Text>

//           {/* Bank Selection */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Select Bank</Text>
//             {renderBankDropdown()}
//           </View>

//           {/* Account Number with Verify Button */}
//           <View style={styles.inputContainer}>
//             <View style={styles.inputHeader}>
//               <Text style={styles.inputLabel}>Account Number</Text>
//               {renderVerifyButton()}
//             </View>
//             <TextInput
//               style={styles.input}
//               placeholder="10-digit account number"
//               placeholderTextColor={BRAND_COLORS.textSecondary}
//               keyboardType="numeric"
//               maxLength={10}
//               value={accountNumber}
//               onChangeText={(text) => {
//                 setAccountNumber(text);
//                 // Clear account name when account number changes
//                 if (text.length !== accountNumber.length) {
//                   setAccountName("");
//                 }
//               }}
//               editable={!isProcessing && !!selectedBank}
//             />
//           </View>

//           {/* Account Name (auto-filled or verified) */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Account Name</Text>
//             <View style={[
//               styles.input,
//               accountName ? styles.verifiedInput : null
//             ]}>
//               <Text style={[
//                 styles.inputText,
//                 accountName ? styles.verifiedText : styles.placeholder
//               ]}>
//                 {accountName || "Account name will appear after verification"}
//               </Text>
//               {accountName && (
//                 <Ionicons name="checkmark-circle" size={20} color={BRAND_COLORS.success} />
//               )}
//             </View>
//           </View>

//           {/* Amount */}
//           <View style={styles.inputContainer}>
//             <Text style={styles.inputLabel}>Amount to Withdraw</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="₦ Amount"
//               placeholderTextColor={BRAND_COLORS.textSecondary}
//               keyboardType="numeric"
//               value={amount}
//               onChangeText={setAmount}
//               editable={!isProcessing}
//             />
//           </View>

//           {/* BREAKDOWN */}
//           <View style={styles.breakdown}>
//             <View style={styles.breakdownRow}>
//               <Text style={styles.breakdownLabel}>Amount:</Text>
//               <Text style={styles.breakdownValue}>
//                 ₦{enteredAmount.toLocaleString()}
//               </Text>
//             </View>
//             <View style={styles.breakdownRow}>
//               <Text style={styles.breakdownLabel}>Processing Fee:</Text>
//               <Text style={styles.breakdownValue}>₦{WITHDRAWAL_CHARGE}</Text>
//             </View>
//             <View style={[styles.breakdownRow, styles.totalRow]}>
//               <Text style={styles.totalLabel}>Total Deducted:</Text>
//               <Text style={styles.totalValue}>
//                 ₦{totalAmount.toLocaleString()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* WITHDRAW BUTTON */}
//         <TouchableOpacity
//           style={[
//             styles.withdrawButton,
//             (!isValidAmount() || isProcessing || !accountName) && styles.withdrawButtonDisabled,
//           ]}
//           disabled={!isValidAmount() || isProcessing || !accountName}
//           onPress={handleStartWithdrawal}
//         >
//           {isProcessing ? (
//             <View style={styles.processingContainer}>
//               <ActivityIndicator size="small" color={BRAND_COLORS.background} />
//               <Text style={styles.withdrawText}>Processing...</Text>
//             </View>
//           ) : (
//             <Text style={styles.withdrawText}>
//               Withdraw ₦{totalAmount.toLocaleString()}
//             </Text>
//           )}
//         </TouchableOpacity>

//         {/* INFO BOX */}
//         <View style={styles.infoBox}>
//           <Ionicons name="time-outline" size={18} color={BRAND_COLORS.textSecondary} />
//           <View style={styles.infoContent}>
//             <Text style={styles.infoText}>
//               • Powered by Flutterwave for secure transfers{"\n"}
//               • Processing time: 24-48 hours{"\n"}
//               • Ensure all details are correct before confirming
//             </Text>
//             <View style={styles.securityBadge}>
//               <Ionicons name="shield-checkmark" size={14} color={BRAND_COLORS.success} />
//               <Text style={styles.securityText}>Secured by Flutterwave</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>

//       {/* CONFIRMATION MODAL */}
//       <Modal
//         transparent
//         visible={showConfirm}
//         animationType="fade"
//         onRequestClose={() => !isProcessing && setShowConfirm(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <View style={styles.confirmModalContent}>
//             <View style={styles.modalHeader}>
//               <Ionicons name="card-outline" size={32} color={BRAND_COLORS.primary} />
//               <Text style={styles.modalTitle}>Confirm Withdrawal</Text>
//               <Text style={styles.modalSubtitle}>via Flutterwave</Text>
//             </View>

//             <View style={styles.modalDetails}>
//               <View style={styles.modalDetailRow}>
//                 <Text style={styles.modalDetailLabel}>Bank:</Text>
//                 <Text style={styles.modalDetailValue}>{selectedBank?.name}</Text>
//               </View>
//               <View style={styles.modalDetailRow}>
//                 <Text style={styles.modalDetailLabel}>Account Number:</Text>
//                 <Text style={styles.modalDetailValue}>{accountNumber}</Text>
//               </View>
//               <View style={styles.modalDetailRow}>
//                 <Text style={styles.modalDetailLabel}>Account Name:</Text>
//                 <Text style={styles.modalDetailValue}>{accountName}</Text>
//               </View>
//               <View style={styles.modalDetailRow}>
//                 <Text style={styles.modalDetailLabel}>Amount:</Text>
//                 <Text style={styles.modalDetailValue}>
//                   ₦{enteredAmount.toLocaleString()}
//                 </Text>
//               </View>
//               <View style={styles.modalDetailRow}>
//                 <Text style={styles.modalDetailLabel}>Fee:</Text>
//                 <Text style={styles.modalDetailValue}>₦{WITHDRAWAL_CHARGE}</Text>
//               </View>
//               <View style={[styles.modalDetailRow, styles.modalTotalRow]}>
//                 <Text style={styles.modalDetailLabel}>Total:</Text>
//                 <Text style={[styles.modalDetailValue, styles.modalTotal]}>
//                   ₦{totalAmount.toLocaleString()}
//                 </Text>
//               </View>
//             </View>

//             <View style={styles.modalWarning}>
//               <Ionicons name="alert-circle" size={20} color={BRAND_COLORS.warning} />
//               <Text style={styles.modalWarningText}>
//                 Please confirm all details are correct. Transactions cannot be reversed.
//               </Text>
//             </View>

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.modalButtonCancel]}
//                 onPress={() => setShowConfirm(false)}
//                 disabled={isProcessing}
//               >
//                 <Text style={styles.modalButtonCancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.modalButton, styles.modalButtonConfirm]}
//                 onPress={processFlutterwaveWithdrawal}
//                 disabled={isProcessing}
//               >
//                 {isProcessing ? (
//                   <ActivityIndicator size="small" color={BRAND_COLORS.background} />
//                 ) : (
//                   <Text style={styles.modalButtonConfirmText}>Confirm Withdrawal</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default WithdrawScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: BRAND_COLORS.background,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: BRAND_COLORS.textPrimary,
//   },
//   content: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 20,
//     paddingBottom: 40,
//   },
//   balanceCard: {
//     backgroundColor: BRAND_COLORS.cardBg,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#e8e8e8",
//   },
//   balanceRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   balanceLabel: {
//     fontSize: 14,
//     color: BRAND_COLORS.textSecondary,
//     fontWeight: "500",
//   },
//   balanceAmount: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: BRAND_COLORS.textPrimary,
//     marginTop: 4,
//   },
//   balanceDivider: {
//     height: 1,
//     backgroundColor: "#e0e0e0",
//     marginVertical: 12,
//   },
//   balanceInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   balanceInfoText: {
//     fontSize: 12,
//     color: BRAND_COLORS.textSecondary,
//     fontWeight: "500",
//   },
//   flutterwaveBadge: {
//     backgroundColor: "#F5A62310", // Light orange background
//     borderWidth: 1,
//     borderColor: "#F5A62330",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 24,
//     alignItems: "center",
//   },
//   flutterwaveLogo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 4,
//   },
//   flutterwaveText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#F5A623",
//   },
//   flutterwaveSubtext: {
//     fontSize: 12,
//     color: BRAND_COLORS.textSecondary,
//   },
//   formSection: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: BRAND_COLORS.textPrimary,
//     marginBottom: 16,
//   },
//   inputContainer: {
//     marginBottom: 16,
//   },
//   inputHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: BRAND_COLORS.textPrimary,
//   },
//   verifyButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     backgroundColor: "#FF7A0010",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   verifyText: {
//     fontSize: 12,
//     color: BRAND_COLORS.primary,
//     fontWeight: "600",
//   },
//   input: {
//     backgroundColor: BRAND_COLORS.cardBg,
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//     color: BRAND_COLORS.textPrimary,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   verifiedInput: {
//     borderColor: BRAND_COLORS.success,
//     backgroundColor: "#28A74510",
//   },
//   inputText: {
//     fontSize: 16,
//     color: BRAND_COLORS.textPrimary,
//   },
//   verifiedText: {
//     color: BRAND_COLORS.success,
//     fontWeight: "600",
//   },
//   placeholder: {
//     color: BRAND_COLORS.textSecondary,
//   },
//   // Bank Modal Styles
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },
//   bankModalContent: {
//     backgroundColor: BRAND_COLORS.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: "80%",
//     paddingBottom: Platform.OS === "ios" ? 40 : 20,
//   },
//   bankModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#f0f0f0",
//   },
//   bankModalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: BRAND_COLORS.textPrimary,
//   },
//   closeButton: {
//     padding: 4,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: BRAND_COLORS.cardBg,
//     marginHorizontal: 20,
//     marginVertical: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#e0e0e0",
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 16,
//     color: BRAND_COLORS.textPrimary,
//     paddingVertical: 0,
//   },
//   bankListContent: {
//     paddingBottom: 20,
//   },
//   bankItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   bankItemSelected: {
//     backgroundColor: "#FFF5E6",
//   },
//   bankItemContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   bankIconContainer: {
//     width: 40,
//     alignItems: "center",
//   },
//   bankName: {
//     fontSize: 16,
//     color: BRAND_COLORS.textPrimary,
//     marginLeft: 12,
//     flex: 1,
//   },
//   bankNameSelected: {
//     color: BRAND_COLORS.primary,
//     fontWeight: "600",
//   },
//   separator: {
//     height: 1,
//     backgroundColor: "#f0f0f0",
//     marginHorizontal: 20,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: BRAND_COLORS.textSecondary,
//   },
//   popularSection: {
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: "#f0f0f0",
//   },
//   popularTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: BRAND_COLORS.textSecondary,
//     marginBottom: 10,
//   },
//   popularScroll: {
//     marginHorizontal: -5,
//   },
//   popularScrollContent: {
//     paddingHorizontal: 5,
//   },
//   popularChip: {
//     backgroundColor: "#FF7A0010",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: "#FF7A0030",
//   },
//   popularChipText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: BRAND_COLORS.primary,
//   },
//   breakdown: {
//     backgroundColor: BRAND_COLORS.cardBg,
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   breakdownRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   totalRow: {
//     marginTop: 8,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#ddd",
//   },
//   breakdownLabel: {
//     fontSize: 14,
//     color: BRAND_COLORS.textSecondary,
//   },
//   breakdownValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: BRAND_COLORS.textPrimary,
//   },
//   totalLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: BRAND_COLORS.textPrimary,
//   },
//   totalValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: BRAND_COLORS.primary,
//   },
//   withdrawButton: {
//     backgroundColor: BRAND_COLORS.primary,
//     padding: 18,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 10,
//     shadowColor: BRAND_COLORS.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   withdrawButtonDisabled: {
//     backgroundColor: "#ccc",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   processingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   withdrawText: {
//     color: BRAND_COLORS.background,
//     fontWeight: "700",
//     fontSize: 16,
//   },
//   infoBox: {
//     flexDirection: "row",
//     backgroundColor: "#F8F9FA",
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: BRAND_COLORS.primary,
//   },
//   infoContent: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   infoText: {
//     fontSize: 12,
//     color: BRAND_COLORS.textSecondary,
//     lineHeight: 18,
//     marginBottom: 8,
//   },
//   securityBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     alignSelf: 'flex-start',
//     backgroundColor: "#28A74510",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   securityText: {
//     fontSize: 11,
//     color: BRAND_COLORS.success,
//     fontWeight: "600",
//   },
//   toast: {
//     position: "absolute",
//     left: 20,
//     right: 20,
//     top: 0,
//     padding: 12,
//     borderRadius: 10,
//     zIndex: 1000,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   toastText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   confirmModalContent: {
//     backgroundColor: BRAND_COLORS.background,
//     padding: 24,
//     borderRadius: 16,
//     width: "90%",
//     maxWidth: 400,
//     maxHeight: "80%",
//     alignSelf: "center",
//   },
//   modalHeader: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginTop: 12,
//     textAlign: "center",
//     color: BRAND_COLORS.textPrimary,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: BRAND_COLORS.textSecondary,
//     marginTop: 4,
//   },
//   modalDetails: {
//     backgroundColor: BRAND_COLORS.cardBg,
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 20,
//   },
//   modalDetailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   modalTotalRow: {
//     marginTop: 8,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#ddd",
//   },
//   modalDetailLabel: {
//     fontSize: 14,
//     color: BRAND_COLORS.textSecondary,
//   },
//   modalDetailValue: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: BRAND_COLORS.textPrimary,
//     textAlign: "right",
//     flex: 1,
//     marginLeft: 10,
//   },
//   modalTotal: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: BRAND_COLORS.primary,
//   },
//   modalWarning: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     backgroundColor: "#FFC10710",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 24,
//     gap: 8,
//   },
//   modalWarningText: {
//     fontSize: 12,
//     color: BRAND_COLORS.warning,
//     flex: 1,
//     lineHeight: 16,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     minHeight: 48,
//   },
//   modalButtonCancel: {
//     backgroundColor: BRAND_COLORS.cardBg,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//   },
//   modalButtonConfirm: {
//     backgroundColor: BRAND_COLORS.primary,
//     marginLeft: 10,
//   },
//   modalButtonCancelText: {
//     color: BRAND_COLORS.textSecondary,
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   modalButtonConfirmText: {
//     color: BRAND_COLORS.background,
//     fontWeight: "700",
//     fontSize: 16,
//   },
// });

import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const { width } = Dimensions.get("window");

const WITHDRAWAL_CHARGE = 0;
const MIN_WITHDRAWAL = 100;
const MAX_WITHDRAWAL = 1000000;

// Nigerian banks with codes (required for Flutterwave)
const banks = [
  { name: "Access Bank", code: "044", color: "#E30613", icon: "business" },
  { name: "First Bank", code: "011", color: "#003366", icon: "business" },
  { name: "Guarantee Trust Bank (GTB)", code: "058", color: "#2A9D8F", icon: "business" },
  { name: "United Bank for Africa (UBA)", code: "033", color: "#FF7A00", icon: "business" },
  { name: "Zenith Bank", code: "057", color: "#14213D", icon: "business" },
  { name: "Opay", code: "099", color: "#000000", icon: "phone-portrait" },
  { name: "Palmpay", code: "100", color: "#FF6B35", icon: "phone-portrait" },
  { name: "Kuda Bank", code: "50211", color: "#401F3E", icon: "phone-portrait" },
  { name: "Moniepoint", code: "50515", color: "#0F4C75", icon: "phone-portrait" },
  { name: "Ecobank Nigeria", code: "050", color: "#006400", icon: "business" },
  { name: "Fidelity Bank", code: "070", color: "#8B0000", icon: "business" },
  { name: "First City Monument Bank (FCMB)", code: "214", color: "#FF7A00", icon: "business" },
  { name: "Heritage Bank", code: "030", color: "#C41E3A", icon: "business" },
  { name: "Keystone Bank", code: "082", color: "#001F3F", icon: "business" },
  { name: "Polaris Bank", code: "076", color: "#001F3F", icon: "business" },
  { name: "Stanbic IBTC Bank", code: "221", color: "#003366", icon: "business" },
  { name: "Standard Chartered Bank", code: "068", color: "#1E3A8A", icon: "business" },
  { name: "Sterling Bank", code: "232", color: "#006400", icon: "business" },
  { name: "Union Bank", code: "032", color: "#8B0000", icon: "business" },
  { name: "Unity Bank", code: "215", color: "#228B22", icon: "business" },
  { name: "Wema Bank", code: "035", color: "#8B0000", icon: "business" },
];

const WithdrawScreen = ({ navigation }) => {
  const { user, refreshUser } = useContext(AuthContext);

  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankList, setShowBankList] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOption, setSelectedOption] = useState("bank"); // 'bank' or 'mobile'
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---------------- TOAST ---------------- */
  const toastAnim = useRef(new Animated.Value(-100)).current;
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const showToast = (msg, type = "info") => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);

    Animated.timing(toastAnim, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastVisible(false));
    }, 3500);
  };

  /* ---------------- VALIDATE ACCOUNT NUMBER ---------------- */
  const validateAccountNumber = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length < 10) {
      showToast("Please select a bank and enter a valid account number", "error");
      return false;
    }

    try {
      setIsProcessing(true);
      
      const bankCode = selectedBank.code;
      let payload = {
        account_number: accountNumber,
        bank_code: bankCode,
      };

      // Add fintech flag for mobile money banks
      const isFintech = ["opay", "palmpay", "kuda", "moniepoint"].includes(selectedBank.name.toLowerCase());
      if (isFintech) {
        payload.is_fintech = true;
        payload.bank_name = selectedBank.name;
      }

      const res = await api.post("/wallet/verify-account", payload);

      if (res.data?.success) {
        setAccountName(res.data.account_name);
        showToast("Account verified successfully", "success");
        return true;
      } else {
        showToast(res.data?.message || "Account verification failed", "error");
        return false;
      }
    } catch (error) {
      console.log("Account verification error:", error);
      
      // Special handling for fintech banks
      const isFintech = ["opay", "palmpay", "kuda", "moniepoint"].includes(selectedBank.name.toLowerCase());
      if (isFintech) {
        showToast(
          `${selectedBank.name} account verification might take longer. Please ensure account details are correct.`,
          "warning"
        );
        if (!accountName) {
          setAccountName(`${selectedBank.name} Account Holder`);
        }
        return true;
      } else {
        showToast(
          error.response?.data?.message || 
          "Account verification failed. Please check details.", 
          "error"
        );
        return false;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------- AMOUNT VALIDATION ---------------- */
  const enteredAmount = Number(amount) > 0 ? Number(amount) : 0;
  const totalAmount = enteredAmount + WITHDRAWAL_CHARGE;
  const isValidAmount = () => enteredAmount >= MIN_WITHDRAWAL && enteredAmount <= MAX_WITHDRAWAL;

  /* ---------------- VALIDATE FORM ---------------- */
  const validateForm = () => {
    if (!isValidAmount()) {
      if (enteredAmount < MIN_WITHDRAWAL) {
        showToast(`Minimum withdrawal is ₦${MIN_WITHDRAWAL}`, "error");
      } else if (enteredAmount > MAX_WITHDRAWAL) {
        showToast(`Maximum withdrawal is ₦${MAX_WITHDRAWAL.toLocaleString()}`, "error");
      }
      return false;
    }

    if (!accountNumber || accountNumber.length < 10) {
      showToast("Please enter a valid 10-digit account number", "error");
      return false;
    }

    if (!selectedBank) {
      showToast("Please select a bank", "error");
      return false;
    }

    // Special handling for fintech banks
    const isFintech = ["opay", "palmpay", "kuda", "moniepoint"].includes(selectedBank.name.toLowerCase());
    if (isFintech) {
      if (!accountName || accountName.trim().length < 2) {
        setAccountName(`${selectedBank.name} Account Holder`);
      }
    } else if (!accountName || accountName.trim().length < 2) {
      showToast("Please verify account name", "error");
      return false;
    }

    if (enteredAmount > (user?.mainBalance || 0)) {
      showToast("Insufficient balance", "error");
      return false;
    }

    return true;
  };

  /* ---------------- START WITHDRAWAL ---------------- */
  const handleStartWithdrawal = async () => {
    if (isProcessing) {
      showToast("Please wait for current transaction to complete", "info");
      return;
    }

    if (!validateForm()) return;

    setShowConfirm(true);
  };

  /* ---------------- PROCESS WITHDRAWAL VIA FLUTTERWAVE ---------------- */
  const processFlutterwaveWithdrawal = async () => {
    setIsProcessing(true);
    setShowConfirm(false);

    try {
      const reference = `flw_withdraw_${user._id}_${Date.now()}`;
      
      const payload = {
        tx_ref: reference,
        amount: enteredAmount,
        account_bank: selectedBank.code,
        account_number: accountNumber,
        beneficiary_name: accountName.trim(),
        narration: `Withdrawal from Biggi Data`,
        currency: "NGN",
      };

      const res = await api.post("/wallet/flutterwave-withdraw", payload);

      if (res.data?.success) {
        await refreshUser();
        
        showToast("Withdrawal initiated successfully! 🎉", "success");
        
        // Reset form
        setAmount("");
        setAccountNumber("");
        setAccountName("");
        setSelectedBank(null);
      } else {
        showToast(res.data?.message || "Withdrawal failed", "error");
      }
    } catch (error) {
      console.log("Flutterwave withdrawal error:", error);
      showToast(
        error.response?.data?.message ||
        "Failed to process withdrawal. Please try again.",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------- BANK SELECTION OPTIONS ---------------- */
  const renderBankOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          selectedOption === "bank" && styles.optionButtonActive,
        ]}
        onPress={() => setSelectedOption("bank")}
      >
        <Ionicons 
          name="business" 
          size={24} 
          color={selectedOption === "bank" ? "#fff" : "#666"} 
        />
        <Text style={[
          styles.optionText,
          selectedOption === "bank" && styles.optionTextActive
        ]}>
          Bank Transfer
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.optionButton,
          selectedOption === "mobile" && styles.optionButtonActive,
        ]}
        onPress={() => setSelectedOption("mobile")}
      >
        <Ionicons 
          name="phone-portrait" 
          size={24} 
          color={selectedOption === "mobile" ? "#fff" : "#666"} 
        />
        <Text style={[
          styles.optionText,
          selectedOption === "mobile" && styles.optionTextActive
        ]}>
          Mobile Money
        </Text>
      </TouchableOpacity>
    </View>
  );

  /* ---------------- RENDER BANK DROPDOWN ---------------- */
  const renderBankDropdown = () => (
    <>
      <TouchableOpacity
        style={styles.bankSelector}
        onPress={() => setShowBankList(!showBankList)}
        disabled={isProcessing}
      >
        {selectedBank ? (
          <View style={styles.selectedBankInfo}>
            <View style={[styles.bankLogo, { backgroundColor: selectedBank.color + "20" }]}>
              <Ionicons name={selectedBank.icon} size={22} color={selectedBank.color} />
            </View>
            <Text style={styles.selectedBankName}>{selectedBank.name}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Select bank...</Text>
        )}
        <Ionicons 
          name={showBankList ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </TouchableOpacity>

      {showBankList && (
        <Modal
          transparent={true}
          visible={showBankList}
          animationType="slide"
          onRequestClose={() => setShowBankList(false)}
        >
          <View style={styles.modalBackdrop}>
            <MotiView
              from={{ translateY: 300 }}
              animate={{ translateY: 0 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.bankModalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Bank</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowBankList(false)}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search bank..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              </View>
              
              <FlatList
                data={filteredBanks}
                keyExtractor={(item, index) => `${item.code}-${index}`}
                renderItem={({ item, index }) => (
                  <MotiView
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: index * 50 }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.bankItem,
                        selectedBank?.code === item.code && styles.bankItemSelected
                      ]}
                      onPress={() => {
                        setSelectedBank(item);
                        setShowBankList(false);
                        setSearchQuery("");
                        setAccountName("");
                      }}
                    >
                      <View style={styles.bankItemContent}>
                        <View style={[styles.bankItemLogo, { backgroundColor: item.color + "20" }]}>
                          <Ionicons name={item.icon} size={20} color={item.color} />
                        </View>
                        <Text style={styles.bankItemName}>{item.name}</Text>
                      </View>
                      {selectedBank?.code === item.code && (
                        <Ionicons name="checkmark-circle" size={22} color="#FF7A00" />
                      )}
                    </TouchableOpacity>
                  </MotiView>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.bankListContent}
              />
            </MotiView>
          </View>
        </Modal>
      )}
    </>
  );

  /* ---------------- VERIFY ACCOUNT BUTTON ---------------- */
  const renderVerifyButton = () => {
    if (!selectedBank || !accountNumber || accountNumber.length < 10 || isProcessing) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.verifyButton}
        onPress={validateAccountNumber}
        disabled={isProcessing}
      >
        <Ionicons name="checkmark-circle-outline" size={16} color="#FF7A00" />
        <Text style={styles.verifyText}>Verify Account</Text>
      </TouchableOpacity>
    );
  };

  const mainBalance = Number(user?.mainBalance || 0);

  return (
    <SafeAreaView style={styles.container}>
      {toastVisible && (
        <Animated.View
          style={[
            styles.toast,
            {
              transform: [{ translateY: toastAnim }],
              backgroundColor: toastType === "error" ? "#FF3B30" : toastType === "success" ? "#4CAF50" : "#FF7A00",
            },
          ]}
        >
          <Ionicons 
            name={toastType === "error" ? "alert-circle" : toastType === "success" ? "checkmark-circle" : "information-circle"} 
            size={18} 
            color="#fff" 
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* HEADER */}
      <LinearGradient
        colors={["#FF7A00", "#FF5C00"]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <TouchableOpacity onPress={() => navigation.navigate("screens/WithdrawalHistoryScreen")}>
          <Ionicons name="time-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <Animated.ScrollView 
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* BALANCE CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIcon}>
              <Ionicons name="wallet" size={24} color="#FF7A00" />
            </View>
            <Text style={styles.balanceTitle}>Available Balance</Text>
          </View>
          
          <Text style={styles.balanceAmount}>₦{mainBalance.toLocaleString()}</Text>
          
          <View style={styles.balanceInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.infoText}>No hidden fees</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="time" size={14} color="#FF7A00" />
              <Text style={styles.infoText}>24-48 hours</Text>
            </View>
          </View>
        </MotiView>

        {/* BANK OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Method</Text>
          {renderBankOptions()}
        </View>

        {/* WITHDRAWAL FORM */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          
          {/* Bank Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Select Bank</Text>
            {renderBankDropdown()}
          </View>

          {/* Account Number */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Account Number</Text>
              {renderVerifyButton()}
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="card-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="10-digit account number"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  if (text.length !== accountNumber.length) {
                    setAccountName("");
                  }
                }}
                editable={!isProcessing && !!selectedBank}
              />
            </View>
          </View>

          {/* Account Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Name</Text>
            <View style={[styles.inputWrapper, accountName && styles.verifiedInput]}>
              <Ionicons 
                name={accountName ? "checkmark-circle" : "person-outline"} 
                size={20} 
                color={accountName ? "#4CAF50" : "#666"} 
                style={styles.inputIcon} 
              />
              <Text style={[
                styles.accountNameText,
                accountName && styles.verifiedText
              ]}>
                {accountName || "Account name will appear after verification"}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount to Withdraw</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="cash-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                editable={!isProcessing}
              />
            </View>
          </View>

          {/* Amount Breakdown */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Withdrawal Amount</Text>
              <Text style={styles.breakdownValue}>₦{enteredAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Processing Fee</Text>
              <Text style={styles.breakdownValue}>₦{WITHDRAWAL_CHARGE}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.breakdownRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₦{totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* WITHDRAW BUTTON */}
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!isValidAmount() || isProcessing || !accountName) && styles.withdrawButtonDisabled,
          ]}
          disabled={!isValidAmount() || isProcessing || !accountName}
          onPress={handleStartWithdrawal}
        >
          <LinearGradient
            colors={["#FF7A00", "#FF5C00"]}
            style={styles.withdrawButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-up-circle" size={20} color="#fff" />
                <Text style={styles.withdrawButtonText}>
                  Withdraw ₦{totalAmount.toLocaleString()}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* INFO SECTION */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • Powered by Flutterwave for secure transfers{"\n"}
              • Processing time: 24-48 hours{"\n"}
              • Minimum withdrawal: ₦100{"\n"}
              • Maximum withdrawal: ₦1,000,000
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* CONFIRMATION MODAL */}
      <Modal
        transparent
        visible={showConfirm}
        animationType="fade"
        onRequestClose={() => !isProcessing && setShowConfirm(false)}
      >
        <View style={styles.confirmModalBackdrop}>
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            style={styles.confirmModalContent}
          >
            <View style={styles.modalIcon}>
              <Ionicons name="card" size={40} color="#FF7A00" />
            </View>
            
            <Text style={styles.confirmTitle}>Confirm Withdrawal</Text>
            <Text style={styles.confirmSubtitle}>Review details before proceeding</Text>
            
            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Bank</Text>
                <Text style={styles.confirmValue}>{selectedBank?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Account Number</Text>
                <Text style={styles.confirmValue}>{accountNumber}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Account Name</Text>
                <Text style={styles.confirmValue}>{accountName}</Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.totalConfirmLabel}>Total Amount</Text>
                <Text style={styles.totalConfirmValue}>₦{totalAmount.toLocaleString()}</Text>
              </View>
            </View>
            
            <View style={styles.warningBox}>
              <Ionicons name="alert-circle" size={18} color="#FF7A00" />
              <Text style={styles.warningText}>
                Transactions cannot be reversed. Please ensure all details are correct.
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirm(false)}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={processFlutterwaveWithdrawal}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm & Withdraw</Text>
                )}
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  balanceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FF7A0020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FF7A00",
    marginBottom: 20,
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#e0e0e0",
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 15,
    paddingLeft: 5,
  },
  optionsContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  optionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  optionButtonActive: {
    backgroundColor: "#FF7A00",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  optionTextActive: {
    color: "#fff",
  },
  formSection: {
    marginTop: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 14,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A0010",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  verifyText: {
    fontSize: 12,
    color: "#FF7A00",
    fontWeight: "600",
  },
  verifiedInput: {
    borderColor: "#4CAF50",
    backgroundColor: "#4CAF5010",
  },
  accountNameText: {
    flex: 1,
    fontSize: 16,
    color: "#999",
    paddingVertical: 14,
  },
  verifiedText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  bankSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  selectedBankInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedBankName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  bankModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: "80%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
    paddingVertical: 0,
  },
  bankListContent: {
    paddingBottom: 20,
  },
  bankItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bankItemSelected: {
    backgroundColor: "#FFF5E6",
  },
  bankItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bankItemLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankItemName: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 20,
  },
  breakdownCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#666",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF7A00",
  },
  withdrawButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 30,
    marginBottom: 20,
  },
  withdrawButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  withdrawButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  infoSection: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  confirmModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF7A0010",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  confirmDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  confirmLabel: {
    fontSize: 14,
    color: "#666",
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  confirmDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
  totalConfirmLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  totalConfirmValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FF7A00",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FF7A0010",
    borderRadius: 12,
    padding: 16,
    marginBottom: 25,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#FF7A00",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  toast: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    flex: 1,
  },
});