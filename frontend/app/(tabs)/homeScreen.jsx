// frontend/app/(tabs)/homeScreen.jsx - NO GAMBLING ELEMENTS
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
    markNotificationsAsSeen
  } = useContext(AuthContext);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // New modal states
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [permissionModalData, setPermissionModalData] = useState({
    title: "",
    message: "",
    type: "info"
  });
  
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadModalData, setUploadModalData] = useState({
    title: "",
    message: "",
    type: "success"
  });

  const spinValue = useRef(new Animated.Value(0)).current;
  const notificationPulseAnim = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      refreshUser();
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

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Permission modal function
  const showPermissionModal = (title, message, type = "info") => {
    setPermissionModalData({ title, message, type });
    setPermissionModalVisible(true);
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
  const dataBundleCount = Number(user.dataBundleCount || 0);
  const totalSavings = Number(user.totalSavings || 0);

  const goToDeposit = () => navigation.navigate("depositScreen");
  const goToWithdraw = () => navigation.navigate("withdrawScreen");
  const goToBundle = () => navigation.navigate("screens/BuyDataScreen");
  const goToRedeem = () => navigation.navigate("redeemScreen");
  const goToHistory = () => navigation.navigate("historyScreen");
  
  const goToNotification = () => {
    markNotificationsAsSeen();
    navigation.navigate("notificationScreen");
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

        {/* DATA STATS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="wifi" size={24} color="#FF7A00" />
            <Text style={styles.statNumber}>{dataBundleCount}</Text>
            <Text style={styles.statLabel}>Bundles Purchased</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={24} color="#FF7A00" />
            <Text style={styles.statNumber}>₦{totalSavings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Savings</Text>
          </View>
        </View>

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
                <Text style={styles.bundleTitle}>Buy Data Bundle</Text>
                <Text style={styles.bundleDesc}>Affordable data bundles for all networks</Text>
                <TouchableOpacity style={styles.bigBtn} onPress={goToBundle}>
                  <Text style={styles.bigBtnText}>Buy Data Now</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bundleRight}>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Instant Delivery</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>Best Prices</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>All Networks</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>24/7 Support</Text>
                  </View>
                </View>
              </View>
            </MotiView>

            {/* TRANSACTION HISTORY */}
            <MotiView
              from={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ loop: true, duration: 2000 }}
              style={styles.historyCard}
            >
              <View style={styles.historyHeader}>
                <Ionicons name="time" size={24} color="#fff" />
                <Text style={styles.historyTitle}>Recent Transactions</Text>
              </View>
              <TouchableOpacity style={styles.historyBtn} onPress={goToHistory}>
                <Text style={styles.historyBtnText}>View All Transactions</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </MotiView>

            {/* BENEFITS SECTION */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Why Choose Biggidata?</Text>
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="shield-checkmark" size={22} color="#FF7A00" />
                  </View>
                  <Text style={styles.benefitText}>Secure & Reliable</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="flash" size={22} color="#FF7A00" />
                  </View>
                  <Text style={styles.benefitText}>Instant Delivery</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="cash" size={22} color="#FF7A00" />
                  </View>
                  <Text style={styles.benefitText}>Lowest Prices</Text>
                </View>
                <View style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name="headset" size={22} color="#FF7A00" />
                  </View>
                  <Text style={styles.benefitText}>24/7 Support</Text>
                </View>
              </View>
            </View>
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
  bundleGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: "#FF7A00",
    shadowRadius: 20,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    zIndex: -1,
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
  
  // STATS SECTION
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  statNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 4,
  },
  statLabel: {
    color: "#bbb",
    fontSize: 12,
    textAlign: "center",
  },

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
  bundleTitle: { 
    fontWeight: "700", 
    marginVertical: 6, 
    fontSize: 16,
    textAlign: "center"
  },
  bundleDesc: { 
    fontSize: 13, 
    color: "#333", 
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  bigBtn: {
    backgroundColor: "#000",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  bigBtnText: { 
    fontSize: 14, 
    color: "#fff",
    fontWeight: "600"
  },
  featureList: {
    marginLeft: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  featureText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 6,
  },

  // HISTORY CARD
  historyCard: {
    backgroundColor: "#222",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  historyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF7A00",
    borderRadius: 8,
    paddingVertical: 12,
  },
  historyBtnText: {
    color: "#fff",
    fontWeight: "700",
    marginRight: 8,
  },

  // BENEFITS SECTION
  benefitsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#222",
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  benefitItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIcon: {
    backgroundColor: "#FFF5E6",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },

  // PREVIEW MODAL STYLES
  previewBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 14,
    width: "90%",
    alignItems: "center",
  },
  previewTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginVertical: 15,
    borderWidth: 3,
    borderColor: "#FF7A00",
  },
  previewBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
});