import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

const SelectPlanScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { selectedNetwork, networkCode, categories } = route.params;

  const [activeCategory, setActiveCategory] = useState(categories[0]); // SME, CG, GIFTING
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlans();
  }, [activeCategory]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const url = `http://localhost:5000/api/v1/data/plans/${networkCode}/${activeCategory}`;

      const res = await axios.get(url);

      setPlans(res.data.plans || []);
    } catch (err) {
      setError("Could not load plans");
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = (plan) => {
    navigation.navigate("BuyDataScreen", {
      selectedPlan: plan,
      selectedNetwork,
      category: activeCategory,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 15 }}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: 10 }}
      >
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      {/* Header */}
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        {selectedNetwork} Data Plans
      </Text>

      {/* Category Tabs */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 15,
          justifyContent: "space-between",
        }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 18,
              borderRadius: 20,
              backgroundColor:
                activeCategory === cat ? "#FF7A00" : "#f0f0f0",
            }}
          >
            <Text
              style={{
                color: activeCategory === cat ? "#fff" : "#000",
                fontWeight: "600",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Plans Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : error ? (
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      ) : plans.length === 0 ? (
        <Text style={{ color: "#333", marginTop: 50, textAlign: "center" }}>
          No plans available for {activeCategory}
        </Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {plans.map((plan, index) => (
            <TouchableOpacity
              key={index}
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
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {plan.name}
                </Text>

                <Text style={{ opacity: 0.6 }}>
                  {plan.size || plan.volume} •{" "}
                  {plan.validity || plan.duration || "N/A"}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#000",
                }}
              >
                ₦{plan.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default SelectPlanScreen;


