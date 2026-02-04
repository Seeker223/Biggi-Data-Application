// screens/SelectPlanScreen.jsx
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions 
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../utils/api";

const { width } = Dimensions.get("window");

const SelectPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectedNetwork, networkCode, categories } = route.params;
  const [activeCategory, setActiveCategory] = useState(categories?.[0] || "SME");
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [popularPlans, setPopularPlans] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadPlans = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/plans/network/${networkCode}`);

        if (mounted) {
          const allPlans = (res.data.plans || []).map((p) => ({
            ...p,
            plan_id: p.code || p.plan_id || p.id || p._id,
            id: p.id || p._id || p.plan_id || p.code,
          }));
          
          setPlans(allPlans);
          
          // Identify popular plans (plans with highest data size)
          const sortedByData = [...allPlans].sort((a, b) => {
            const sizeA = parseInt(a.size || a.volume || "0");
            const sizeB = parseInt(b.size || b.volume || "0");
            return sizeB - sizeA;
          });
          
          setPopularPlans(sortedByData.slice(0, 2)); // Top 2 plans
        }
      } catch (err) {
        console.log("Plan fetch error:", err?.response?.data || err);
        if (mounted) setError("Could not load plans. Please retry.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPlans();
    return () => (mounted = false);
  }, [networkCode]);

  useEffect(() => {
    const filtered = plans.filter(
      (p) => (p.category || "").trim().toUpperCase() === activeCategory.trim().toUpperCase()
    );
    setFilteredPlans(filtered);
  }, [activeCategory, plans]);

  const selectPlan = (plan) => {
    navigation.navigate("screens/BuyDataScreen", {
      selectedPlan: plan,
      selectedNetwork,
      category: activeCategory,
      networkCode,
    });
  };

  const getNetworkColor = () => {
    switch(networkCode?.toLowerCase()) {
      case 'mtn': return '#FFC107';
      case 'airtel': return '#E30613';
      case 'glo': return '#008000';
      case 'etisalat': return '#FF7A00';
      default: return '#FF7A00';
    }
  };

  const getNetworkIcon = () => {
    switch(networkCode?.toLowerCase()) {
      case 'mtn': return 'cellular';
      case 'airtel': return 'cellular-outline';
      case 'glo': return 'wifi';
      case 'etisalat': return 'phone-portrait';
      default: return 'wifi-outline';
    }
  };

  const formatDataSize = (size) => {
    if (!size) return "";
    const num = parseInt(size);
    if (num >= 1000) return `${(num / 1000).toFixed(1)}GB`;
    return `${num}MB`;
  };

  const formatValidity = (validity) => {
    if (!validity) return "Instant";
    if (validity.includes("day") || validity.includes("Day")) return validity;
    if (validity.includes("month") || validity.includes("Month")) return validity;
    return `${validity} days`;
  };

  const isPopularPlan = (plan) => {
    return popularPlans.some(popular => popular.plan_id === plan.plan_id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={[styles.networkBadge, { backgroundColor: getNetworkColor() }]}>
            <Ionicons name={getNetworkIcon()} size={20} color="#fff" />
            <Text style={styles.networkBadgeText}>{selectedNetwork}</Text>
          </View>
          <Text style={styles.headerTitle}>Choose Data Plan</Text>
          <Text style={styles.headerSubtitle}>Select your preferred bundle</Text>
        </View>
        
        <View style={{ width: 26 }} />
      </View>

      {/* Info Card */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
        style={styles.infoCard}
      >
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="flash" size={20} color="#FF7A00" />
            <Text style={styles.infoText}>Instant Delivery</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#FF7A00" />
            <Text style={styles.infoText}>Guaranteed</Text>
          </View>
        </View>
      </MotiView>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Plan Types</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat, index) => (
            <MotiView
              key={cat}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.categoryButton,
                  activeCategory === cat && styles.activeCategoryButton
                ]}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === cat && styles.activeCategoryText
                ]}>
                  {cat}
                </Text>
                {activeCategory === cat && (
                  <View style={styles.activeIndicator} />
                )}
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError("");
              setLoading(true);
              // Re-fetch logic would go here
            }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPlans.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Plans Available</Text>
          <Text style={styles.emptySubtitle}>
            No {activeCategory} plans available for {selectedNetwork}
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => setActiveCategory(categories?.[0])}
          >
            <Text style={styles.browseButtonText}>Browse Other Categories</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Plans List */}
      {!loading && !error && filteredPlans.length > 0 && (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plansContainer}
        >
          {filteredPlans.map((plan, index) => (
            <MotiView
              key={plan.plan_id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                onPress={() => selectPlan(plan)}
                style={[
                  styles.planCard,
                  isPopularPlan(plan) && styles.popularPlanCard
                ]}
              >
                {isPopularPlan(plan) && (
                  <LinearGradient
                    colors={['#FF7A00', '#FF9A00']}
                    style={styles.popularBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="star" size={12} color="#fff" />
                    <Text style={styles.popularText}>POPULAR</Text>
                  </LinearGradient>
                )}
                
                <View style={styles.planContent}>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>
                      {plan.name || plan.plan_name}
                    </Text>
                    <View style={styles.planDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="wifi" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          {formatDataSize(plan.size || plan.volume)}
                        </Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Ionicons name="time" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          {formatValidity(plan.validity || plan.duration)}
                        </Text>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Ionicons name="card" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          {plan.category || activeCategory}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.planPrice}>
                    <Text style={styles.priceAmount}>₦{plan.amount?.toLocaleString()}</Text>
                    <View style={styles.selectButton}>
                      <Text style={styles.selectText}>Select</Text>
                      <Ionicons name="chevron-forward" size={16} color="#FF7A00" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      )}

      {/* Bottom Info */}
      {!loading && !error && filteredPlans.length > 0 && (
        <View style={styles.bottomInfo}>
          <View style={styles.bottomInfoRow}>
            <Ionicons name="information-circle" size={18} color="#FF7A00" />
            <Text style={styles.bottomInfoText}>
              All plans include instant delivery and 24/7 support
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SelectPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Changed from #000 to #fff
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: "#fff", // Changed from #111 to #fff
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    alignItems: "center",
    flex: 1,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  networkBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  headerTitle: {
    color: "#000", // Changed from #fff to #000
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: "#666", // Changed from #bbb to #666
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: "#f9f9f9", // Changed from #222 to #f9f9f9
    marginHorizontal: 20,
    marginTop: 15,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  infoText: {
    color: "#000", // Changed from #fff to #000
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0", // Changed from #444 to #e0e0e0
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#000", // Changed from #fff to #000
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f5f5f5", // Changed from #222 to #f5f5f5
    marginRight: 10,
    alignItems: "center",
    minWidth: 100,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  activeCategoryButton: {
    backgroundColor: "#FF7A00",
    borderColor: "#FF7A00",
  },
  categoryText: {
    color: "#666", // Changed from #bbb to #666
    fontSize: 14,
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "#fff",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -6,
    width: 30,
    height: 3,
    backgroundColor: "#FF7A00",
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    color: "#666", // Changed from #fff to #666
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  errorText: {
    color: "#000", // Changed from #fff to #000
    fontSize: 16,
    marginTop: 15,
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyTitle: {
    color: "#000", // Changed from #fff to #000
    fontSize: 18,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#666", // Changed from #bbb to #666
    fontSize: 14,
    textAlign: "center",
    marginBottom: 25,
    paddingHorizontal: 40,
  },
  browseButton: {
    backgroundColor: "#f5f5f5", // Changed from #222 to #f5f5f5
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  browseButtonText: {
    color: "#FF7A00",
    fontSize: 14,
    fontWeight: "600",
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Reduced from 0.1
    shadowRadius: 8,
    elevation: 4, // Reduced from 5
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  popularPlanCard: {
    borderWidth: 2,
    borderColor: "#FF7A00",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  planContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
    marginRight: 15,
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  planDetails: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  detailDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#e0e0e0", // Changed from #ddd to #e0e0e0
    marginRight: 8,
  },
  planPrice: {
    alignItems: "flex-end",
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF7A0010", // Lighter background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  selectText: {
    color: "#FF7A00",
    fontSize: 12,
    fontWeight: "700",
  },
  bottomInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f9f9f9", // Changed from #222 to #f9f9f9
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  bottomInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bottomInfoText: {
    color: "#000", // Changed from #fff to #000
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});