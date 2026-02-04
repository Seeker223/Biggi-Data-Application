import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SelectNetworkScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);
  const [pressedId, setPressedId] = useState(null);

  const networks = [
    { 
      id: "mtn", 
      name: "MTN", 
      logo: require("../../assets/images/mtn.png"), 
      categories: ["SME", "GIFTING"],
      color: "#FFC107",
      gradient: ["#FFC107", "#FFA000"],
      description: "Largest network coverage",
      icon: "cellular"
    },
    { 
      id: "airtel", 
      name: "Airtel", 
      logo: require("../../assets/images/airtel.png"), 
      categories: ["SME", "GIFTING"],
      color: "#E30613",
      gradient: ["#E30613", "#B80000"],
      description: "Fast 4G speeds",
      icon: "cellular-outline"
    },
    { 
      id: "glo", 
      name: "Glo", 
      logo: require("../../assets/images/glo.png"), 
      categories: ["SME", "CG", "GIFTING"],
      color: "#008000",
      gradient: ["#008000", "#006600"],
      description: "Affordable data plans",
      icon: "wifi"
    },
    { 
      id: "etisalat", 
      name: "9mobile", 
      logo: require("../../assets/images/9mobile.png"), 
      categories: ["SME", "CG", "GIFTING"],
      color: "#FF7A00",
      gradient: ["#FF7A00", "#E56A00"],
      description: "Reliable network service",
      icon: "phone-portrait"
    },
  ];

  const handleSelect = (item) => {
    setSelected(item.id);
    setPressedId(item.id);
    
    // Reset pressed state after animation
    setTimeout(() => {
      setPressedId(null);
      navigation.navigate("screens/SelectPlanScreen", {
        selectedNetwork: item.name,
        networkCode: item.id,
        categories: item.categories,
      });
    }, 300);
  };

  const handlePressIn = (id) => {
    setPressedId(id);
  };

  const handlePressOut = () => {
    setPressedId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#FF7A00", "#FF5C00"]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <Ionicons name="wifi" size={16} color="#fff" />
            <Text style={styles.headerBadgeText}>Data Bundles</Text>
          </View>
          <Text style={styles.headerTitle}>Select Network</Text>
          <Text style={styles.headerSubtitle}>Choose your mobile network</Text>
        </View>
        <View style={{ width: 26 }} />
      </LinearGradient>

      {/* Info Card */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.infoCard}
      >
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color="#FF7A00" />
          <Text style={styles.infoText}>
            Select your network to view available data plans
          </Text>
        </View>
      </MotiView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Networks Grid */}
        <View style={styles.networksGrid}>
          {networks.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100, type: "spring" }}
              style={styles.networkCardWrapper}
            >
              <TouchableOpacity
                style={[
                  styles.networkCard,
                  selected === item.id && styles.networkCardSelected,
                  pressedId === item.id && styles.networkCardPressed
                ]}
                onPress={() => handleSelect(item)}
                onPressIn={() => handlePressIn(item.id)}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
              >
                {/* Selected Indicator */}
                {selected === item.id && (
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.selectedIndicator}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </LinearGradient>
                )}

                {/* Network Logo */}
                <View style={styles.logoContainer}>
                  <View style={[styles.logoBackground, { backgroundColor: item.color + "20" }]}>
                    <Image 
                      source={item.logo} 
                      style={[
                        styles.logo,
                        selected === item.id && styles.logoSelected
                      ]} 
                      resizeMode="contain" 
                    />
                  </View>
                </View>

                {/* Network Info */}
                <View style={styles.networkInfo}>
                  <View style={styles.networkHeader}>
                    <View style={styles.networkNameContainer}>
                      <Ionicons 
                        name={item.icon} 
                        size={16} 
                        color={selected === item.id ? item.color : "#666"} 
                        style={styles.networkIcon}
                      />
                      <Text style={[
                        styles.networkName,
                        selected === item.id && { color: item.color }
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={[
                      styles.statusBadge,
                      selected === item.id && { backgroundColor: item.color + "20" }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        selected === item.id && { color: item.color }
                      ]}>
                        Available
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.networkDescription}>
                    {item.description}
                  </Text>

                  {/* Categories */}
                  <View style={styles.categoriesContainer}>
                    {item.categories.map((category, catIndex) => (
                      <View 
                        key={catIndex} 
                        style={[
                          styles.categoryBadge,
                          { backgroundColor: item.color + "10" }
                        ]}
                      >
                        <Text style={[
                          styles.categoryText,
                          { color: item.color }
                        ]}>
                          {category}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Select Button */}
                  <View style={styles.selectButtonContainer}>
                    <LinearGradient
                      colors={selected === item.id ? item.gradient : ["#f5f5f5", "#f0f0f0"]}
                      style={styles.selectButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[
                        styles.selectButtonText,
                        selected === item.id && styles.selectButtonTextActive
                      ]}>
                        {selected === item.id ? "Selected" : "Select"}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomInfoRow}>
            <Ionicons name="help-circle-outline" size={18} color="#666" />
            <Text style={styles.bottomInfoText}>
              All networks support instant data delivery
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectNetworkScreen;

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
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: "#f0f7ff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1e7ff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    color: "#0066CC",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 12,
    lineHeight: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 100,
  },
  networksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  networkCardWrapper: {
    width: "48%",
    marginBottom: 20,
  },
  networkCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  networkCardSelected: {
    borderColor: "#FF7A00",
    shadowColor: "#FF7A00",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  networkCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoSelected: {
    transform: [{ scale: 1.1 }],
  },
  networkInfo: {
    width: "100%",
  },
  networkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  networkNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  networkIcon: {
    marginRight: 6,
  },
  networkName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
  },
  networkDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 15,
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
  },
  selectButtonContainer: {
    width: "100%",
  },
  selectButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  selectButtonTextActive: {
    color: "#fff",
  },
  bottomInfo: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  bottomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bottomInfoText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
});