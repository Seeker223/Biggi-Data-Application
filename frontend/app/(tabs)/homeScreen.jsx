// frontend/app/(tabs)/homeScreen.jsx - UPDATED WITH MODALS INSTEAD OF ALERTS
import React, { useContext, useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  Platform,
  ActionSheetIOS,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import FloatingBottomNav from "../../components/FloatingBottomNav";
import { AuthContext } from "../../context/AuthContext";
import { updateAvatar } from "../../utils/api";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { 
    user, 
    refreshUser, 
    authLoading, 
    updateUser,
    notificationCount,
    markNotificationsAsSeen,
    resetNotificationCount
  } = useContext(AuthContext);

  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [monthlyEligibility, setMonthlyEligibility] = useState({
    purchases: 0,
    required: 5,
    progress: 0,
    daysLeft: 0,
    isEligible: false
  });

  // New modal states
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionModalData, setPermissionModalData] = useState({
    title: "",
    message: "",
    type: "info"
  });
  
  const [monthlyGameModalVisible, setMonthlyGameModalVisible] = useState(false);
  const [monthlyGameModalData, setMonthlyGameModalData] = useState({
    title: "",
    message: "",
    isEligible: false
  });
  
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadModalData, setUploadModalData] = useState({
    title: "",
    message: "",
    type: "success" // "success" or "error"
  });

  const spinValue = useRef(new Animated.Value(0)).current;
  const notificationPulseAnim = useRef(new Animated.Value(1)).current;
  const monthlyPulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      calculateMonthlyEligibility();
    }, [user])
  );

  useEffect(() => {
    if (notificationCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(notificationPulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(notificationPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      notificationPulseAnim.setValue(1);
    }
  }, [notificationCount]);

  useEffect(() => {
    // Pulse animation for monthly game card when eligible
    if (monthlyEligibility.isEligible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(monthlyPulseAnim, {
            toValue: 1.05,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(monthlyPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [monthlyEligibility.isEligible]);

  useEffect(() => {
    if (uploadingPhoto) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [uploadingPhoto]);

  const calculateMonthlyEligibility = () => {
    const purchases = user?.dataBundleCount || 0;
    const required = 5;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - now.getDate();
    
    setMonthlyEligibility({
      purchases,
      required,
      progress: Math.min(100, (purchases / required) * 100),
      daysLeft: Math.max(0, daysLeft),
      isEligible: purchases >= required
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Permission modal function
  const showPermissionModal = (title, message, type = "info") => {
    setPermissionModalData({ title, message, type });
    setPermissionModalVisible(true);
  };

  // Monthly game modal function
  const showMonthlyGameModal = (title, message, isEligible) => {
    setMonthlyGameModalData({ title, message, isEligible });
    setMonthlyGameModalVisible(true);
  };

  // Upload result modal function
  const showUploadModal = (title, message, type = "success") => {
    setUploadModalData({ title, message, type });
    setUploadModalVisible(true);
  };

  if (authLoading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  const mainBalance = Number(user.mainBalance || 0);
  const rewardBalance = Number(user.rewardBalance || 0);
  const tickets = Number(user.tickets || 0);

  const goToDeposit = () => navigation.navigate("depositScreen");
  const goToWithdraw = () => navigation.navigate("withdrawScreen");
  const goToBundle = () => navigation.navigate("screens/BuyDataScreen");
  const goToRedeem = () => navigation.navigate("redeemScreen");
  const goToDraws = () => navigation.navigate("screens/DailyLuckyDrawScreen");
  
  const goToNotification = () => {
    markNotificationsAsSeen();
    navigation.navigate("notificationScreen");
  };

  const handleDailyGame = () => {
    if (tickets <= 0) return setTicketModalVisible(true);
    navigation.navigate("screens/DailyNumberDrawScreen");
  };

  const handleMonthlyGame = () => {
    if (monthlyEligibility.isEligible) {
      showMonthlyGameModal(
        "Monthly Draw Eligible! 🎉",
        `You've made ${monthlyEligibility.purchases} purchases this month.\n\n` +
        `You're automatically entered into the ₦5,000 monthly draw!\n\n` +
        `Draw happens at the end of the month (${monthlyEligibility.daysLeft} days left).`,
        true
      );
    } else {
      showMonthlyGameModal(
        "Monthly Draw Eligibility",
        `You need ${monthlyEligibility.required} data purchases this month to qualify for the ₦5,000 monthly draw.\n\n` +
        `Your purchases this month: ${monthlyEligibility.purchases}/${monthlyEligibility.required}\n` +
        `Progress: ${Math.round(monthlyEligibility.progress)}%\n` +
        `Days left this month: ${monthlyEligibility.daysLeft}\n\n` +
        `Keep buying data bundles to qualify!`,
        false
      );
    }
  };

  const pickFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      showPermissionModal("Permission required", "Camera roll permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      openPreview(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      showPermissionModal("Permission required", "Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      openPreview(result.assets[0].uri);
    }
  };

  const openPreview = (uri) => {
    setSelectedImageUri(uri);
    setPreviewVisible(true);
  };

  const uploadPhoto = async () => {
    if (!selectedImageUri) return;
    try {
      setUploadingPhoto(true);
      const filename = selectedImageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      const formData = new FormData();
      formData.append("photo", { uri: selectedImageUri, name: filename, type });
      const res = await updateAvatar(formData);
      if (res.success) {
        updateUser({ photo: res.user.photo });
        setPreviewVisible(false);
        setSelectedImageUri(null);
        showUploadModal("Success", "Profile photo updated successfully!", "success");
      } else {
        showUploadModal("Upload Failed", res.msg || "Could not update photo", "error");
      }
    } catch (err) {
      console.log("Upload error:", err);
      showUploadModal("Error", "Failed to upload image. Try again.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Photo", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickFromCamera();
          else if (buttonIndex === 2) pickFromGallery();
        }
      );
    } else {
      // For Android - use custom modal
      setPermissionModalData({
        title: "Update Photo",
        message: "Choose an option",
        type: "choice",
        choices: [
          { text: "Take Photo", action: pickFromCamera },
          { text: "Choose from Gallery", action: pickFromGallery },
          { text: "Cancel", action: () => setPermissionModalVisible(false) }
        ]
      });
      setPermissionModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={handlePhotoPress} disabled={uploadingPhoto}>
              <Image
                source={{ uri: user?.photo || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
                style={styles.avatar}
              />
              {uploadingPhoto && (
                <Animated.View style={[styles.avatarLoader, { transform: [{ rotate: spin }] }]}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                </Animated.View>
              )}
            </TouchableOpacity>
            <View>
              <MotiText
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 600 }}
                style={styles.welcomeText}
              >
                Hi, {user.username}
              </MotiText>
              <Text style={styles.subText}>Welcome back</Text>
            </View>
          </View>
          
          {/* NOTIFICATION BELL WITH BADGE */}
          <TouchableOpacity style={styles.bellBtn} onPress={goToNotification}>
            <Animated.View
              style={[
                styles.bellContainer,
                { transform: [{ scale: notificationPulseAnim }] }
              ]}
            >
              <Ionicons name="notifications" size={26} color="#FF7A00" />
              
              {/* NOTIFICATION BADGE */}
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* WALLET CARD */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800 }}
          style={styles.walletCard}
        >
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Main Balance</Text>
              <Text style={styles.balance}>₦{mainBalance.toLocaleString()}</Text>
            </View>
            <View>
              <TouchableOpacity style={styles.actionBtn} onPress={goToDeposit}>
                <Text style={styles.actionText}>Deposit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={goToWithdraw}>
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.label}>Reward Balance</Text>
              <Text style={styles.balance}>₦{rewardBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.redeemBtn} onPress={goToRedeem}>
              <Text style={styles.actionText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* TICKETS */}
        <Text style={styles.ticketText}>
          🎫 Available Tickets:{" "}
          <Text style={{ color: "#FF7A00", fontWeight: "bold" }}>{tickets}</Text>
        </Text>
        <Text style={styles.infoText}>
          ✅ Buy Any Bundle → Unlock Daily Games + Monthly Draw
        </Text>

        {/* WHITE SECTION */}
        <View style={styles.whiteWrapper}>
          <LinearGradient colors={["#ffffff", "#f7f7f7"]} style={styles.whiteSection}>
            {/* BUNDLE CARD */}
            <MotiView
              from={{ opacity: 0, translateY: 25, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: "timing", duration: 700 }}
              style={styles.bundleCard}
            >
              <MotiView
                from={{ shadowOpacity: 0.1 }}
                animate={{ shadowOpacity: [0.1, 0.4, 0.1] }}
                transition={{ loop: true, duration: 2000 }}
                style={styles.bundleGlowOverlay}
              />
              <View style={styles.bundleLeft}>
                <Ionicons name="wifi-outline" size={28} color="#FF7A00" />
                <Text style={styles.bundleTitle}>Buy Data Bundle Daily</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={goToBundle}>
                  <Text style={styles.smallBtnText}>Buy Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.bundleRight}>
                <View style={styles.ticketIconContainer}>
                  <MotiView
                    from={{ opacity: 0.4, scale: 1 }}
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.15, 1] }}
                    transition={{ loop: true, duration: 1800 }}
                    style={styles.ticketGlow}
                  />
                  <Ionicons name="ticket-outline" size={26} color="#000" />
                  <MotiView
                    style={styles.ticketBadge}
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Text style={styles.ticketBadgeText}>{tickets}</Text>
                  </MotiView>
                </View>
                <Text style={styles.bundleDesc}>Win Daily Tickets + Monthly Draw Entry!</Text>
              </View>
            </MotiView>

            {/* DAILY GAME */}
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ loop: true, duration: 1800 }}
              style={styles.gameCard}
            >
              <Ionicons name="game-controller" size={28} color="#fff" />
              <Text style={styles.gameTitle}>Daily Number Picker Game</Text>
              <Text style={styles.gameSubtitle}>Win ₦2,000 Daily</Text>
              <TouchableOpacity
                style={[styles.playBtn, tickets <= 0 ? styles.disabledBtn : null]}
                onPress={handleDailyGame}
              >
                <Text style={styles.playText}>Play Now</Text>
              </TouchableOpacity>
            </MotiView>

            {/* MONTHLY GAME */}
            <Animated.View
              style={[
                styles.monthlyGameCard,
                { transform: [{ scale: monthlyPulseAnim }] }
              ]}
            >
              <View style={styles.monthlyHeader}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
                <Text style={styles.monthlyTitle}>Monthly Draw</Text>
                {monthlyEligibility.isEligible && (
                  <View style={styles.eligibleBadge}>
                    <Text style={styles.eligibleText}>ELIGIBLE</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.monthlyPrize}>₦5,000</Text>
              <Text style={styles.monthlySubtitle}>Monthly Jackpot</Text>
              
              {/* Monthly Progress */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>
                    {monthlyEligibility.purchases}/{monthlyEligibility.required} purchases
                  </Text>
                  <Text style={styles.progressPercent}>
                    {Math.round(monthlyEligibility.progress)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${monthlyEligibility.progress}%`,
                        backgroundColor: monthlyEligibility.isEligible ? '#4CAF50' : '#8E2DE2'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.daysLeftText}>
                  {monthlyEligibility.daysLeft} days left this month
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.monthlyBtn,
                  monthlyEligibility.isEligible ? styles.eligibleBtn : styles.notEligibleBtn
                ]}
                onPress={handleMonthlyGame}
              >
                <Ionicons 
                  name={monthlyEligibility.isEligible ? "checkmark-circle" : "information-circle"} 
                  size={18} 
                  color="#FFF" 
                />
                <Text style={styles.monthlyBtnText}>
                  {monthlyEligibility.isEligible ? "You're Eligible!" : "Check Eligibility"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* PHOTO PREVIEW MODAL */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Preview Photo</Text>
            <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
            <View style={styles.previewBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
                onPress={() => setPreviewVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={uploadPhoto} disabled={uploadingPhoto}>
                {uploadingPhoto ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Upload</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TICKETS MODAL */}
      <Modal transparent visible={ticketModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle" size={42} color="#FF7A00" />
            <Text style={styles.modalTitle}>No Tickets Available</Text>
            <Text style={styles.modalMsg}>You need at least 1 ticket to play daily games.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={goToBundle}>
              <Text style={styles.modalBtnText}>Buy Data Bundle</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: "#999", marginTop: 8 }]}
              onPress={() => setTicketModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PERMISSION MODAL */}
      <Modal transparent visible={permissionModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons 
              name={permissionModalData.type === "error" ? "close-circle" : "information-circle"} 
              size={42} 
              color={permissionModalData.type === "error" ? "#FF3B30" : "#FF7A00"} 
            />
            <Text style={styles.modalTitle}>{permissionModalData.title}</Text>
            <Text style={styles.modalMsg}>{permissionModalData.message}</Text>
            
            {permissionModalData.type === "choice" ? (
              <View style={styles.modalChoiceContainer}>
                {permissionModalData.choices?.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalBtn,
                      choice.text === "Cancel" && { backgroundColor: "#999" }
                    ]}
                    onPress={() => {
                      setPermissionModalVisible(false);
                      choice.action && choice.action();
                    }}
                  >
                    <Text style={styles.modalBtnText}>{choice.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.modalBtn}
                onPress={() => setPermissionModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* MONTHLY GAME MODAL */}
      <Modal transparent visible={monthlyGameModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons 
              name={monthlyGameModalData.isEligible ? "trophy" : "information-circle"} 
              size={42} 
              color={monthlyGameModalData.isEligible ? "#FFD700" : "#FF7A00"} 
            />
            <Text style={styles.modalTitle}>{monthlyGameModalData.title}</Text>
            <Text style={styles.modalMsg}>{monthlyGameModalData.message}</Text>
            <View style={styles.modalBtnContainer}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: "#FF7A00" }]}
                onPress={() => {
                  setMonthlyGameModalVisible(false);
                  if (monthlyGameModalData.isEligible) {
                    goToDraws();
                  } else {
                    goToBundle();
                  }
                }}
              >
                <Text style={styles.modalBtnText}>
                  {monthlyGameModalData.isEligible ? "View Draws" : "Buy Data"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: "#999", marginTop: 8 }]}
                onPress={() => setMonthlyGameModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* UPLOAD RESULT MODAL */}
      <Modal transparent visible={uploadModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Ionicons 
              name={uploadModalData.type === "success" ? "checkmark-circle" : "close-circle"} 
              size={42} 
              color={uploadModalData.type === "success" ? "#4CAF50" : "#FF3B30"} 
            />
            <Text style={styles.modalTitle}>{uploadModalData.title}</Text>
            <Text style={styles.modalMsg}>{uploadModalData.message}</Text>
            <TouchableOpacity 
              style={[
                styles.modalBtn,
                { backgroundColor: uploadModalData.type === "success" ? "#4CAF50" : "#FF3B30" }
              ]}
              onPress={() => setUploadModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingBottomNav />
    </View>
  );
};

export default HomeScreen;

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bellContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#000",
    zIndex: 10,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 4,
  },

  ticketGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF7A00",
    opacity: 0.2,
  },

  ticketIconContainer: {
    position: "relative",
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  ticketBadge: {
    position: "absolute",
    top: -10,
    right: -12,
    backgroundColor: "#FF7A00",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  ticketBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  bundleGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: "#FF7A00",
    shadowRadius: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    zIndex: -1,
  },

  ticketText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },

  infoText: {
    color: "#fff",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  disabledBtn: {
    backgroundColor: "#999",
    opacity: 0.6,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
    width: "85%",
    alignItems: "center",
  },

  modalTitle: { 
    fontWeight: "bold", 
    fontSize: 18, 
    marginTop: 10,
    textAlign: "center"
  },
  modalMsg: { 
    textAlign: "center", 
    marginVertical: 12, 
    color: "#444",
    lineHeight: 20,
  },

  modalBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 8,
    minWidth: 120,
    alignItems: "center",
  },

  modalBtnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14 
  },

  modalBtnContainer: {
    width: "100%",
    marginTop: 10,
  },

  modalChoiceContainer: {
    width: "100%",
    marginTop: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 16,
  },

  userInfo: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FF7A00",
  },

  avatarLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  welcomeText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  subText: { color: "#bbb", fontSize: 14 },

  bellBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 30,
    elevation: 8,
  },

  walletCard: {
    backgroundColor: "#FFA500",
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 16,
  },

  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: { color: "#222", fontWeight: "600" },

  balance: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000",
  },

  actionBtn: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 4,
  },

  actionText: { color: "#fff", fontWeight: "600" },

  redeemBtn: {
    backgroundColor: "#FF7A00",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  divider: { height: 1, backgroundColor: "#00000030", marginVertical: 10 },

  whiteWrapper: {
    marginTop: 20,
    width,
    alignSelf: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },

  whiteSection: {
    paddingTop: 25,
    paddingHorizontal: 16,
    minHeight: 500,
    paddingBottom: 40,
  },

  bundleCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 10,
    position: "relative",
  },

  bundleLeft: { flex: 1, alignItems: "center" },

  bundleRight: { flex: 1.3 },

  bundleTitle: { fontWeight: "700", marginVertical: 6, fontSize: 15 },

  bundleDesc: { fontSize: 13, color: "#333", lineHeight: 18 },

  smallBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },

  smallBtnText: { fontSize: 12, color: "#fff" },

  dividerVertical: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 10,
  },

  gameCard: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 18,
  },

  gameTitle: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 4,
  },

  gameSubtitle: {
    color: "#FFD700",
    fontSize: 12,
    marginBottom: 8,
  },

  playBtn: {
    backgroundColor: "#FF7A00",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },

  playText: { color: "#fff", fontWeight: "700" },

  // MONTHLY GAME CARD STYLES
  monthlyGameCard: {
    backgroundColor: "#2B006A",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },

  monthlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  monthlyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  eligibleBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },

  eligibleText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },

  monthlyPrize: {
    color: "#FFD700",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },

  monthlySubtitle: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 15,
  },

  progressContainer: {
    marginBottom: 15,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  progressPercent: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "700",
  },

  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
      overflow: "hidden",  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  daysLeftText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  monthlyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
  },
  eligibleBtn: {
    backgroundColor: '#4CAF50',
  },
  notEligibleBtn: {
    backgroundColor: '#8E2DE2',
  },
  monthlyBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },

  // PREVIEW MODAL STYLES
  previewBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 14,
    width: '90%',
    alignItems: 'center',
  },
  previewTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 15,
    borderWidth: 3,
    borderColor: '#FF7A00',
  },
  previewBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
});