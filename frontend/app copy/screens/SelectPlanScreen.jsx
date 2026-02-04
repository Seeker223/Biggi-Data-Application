// screens/SelectPlanScreen
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../../utils/api";

const SelectPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectedNetwork, networkCode, categories } = route.params;
  const [activeCategory, setActiveCategory] = useState(categories?.[0] || "SME");
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            plan_id: p.code || p.plan_id || p.id || p._id, // ✅ backend plan code
            id: p.id || p._id || p.plan_id || p.code,
          }));
          setPlans(allPlans);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 15 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
        <Ionicons name="chevron-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10, color: "#000" }}>
        {selectedNetwork} Data Plans
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 30,
              backgroundColor: activeCategory === cat ? "#FF7A00" : "#ececec",
              marginRight: 10,
            }}
          >
            <Text style={{ color: activeCategory === cat ? "#fff" : "#000", fontWeight: "600", fontSize: 13 }}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#FF7A00" />
      ) : error ? (
        <Text style={{ color: "red", fontSize: 16, marginTop: 30, textAlign: "center" }}>{error}</Text>
      ) : filteredPlans.length === 0 ? (
        <Text style={{ marginTop: 50, textAlign: "center", fontSize: 16, color: "#000" }}>
          No plans available for {activeCategory}.
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredPlans.map((plan) => (
            <TouchableOpacity
              key={plan.plan_id}
              onPress={() => selectPlan(plan)}
              style={{
                padding: 15,
                marginVertical: 8,
                backgroundColor: "#f8f8f8",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e1e1e1",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                  {plan.name || plan.plan_name}
                </Text>
                <Text style={{ opacity: 0.6, marginTop: 3 }}>
                  {(plan.size || plan.volume || "") + " • " + (plan.validity || plan.duration || "No validity")}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>₦{plan.amount}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SelectPlanScreen;
