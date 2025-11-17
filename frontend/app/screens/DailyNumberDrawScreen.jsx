import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";  // FIXED PATH
import api from "../../utils/api";   // ✅ use axios wrapper

const { width } = Dimensions.get("window");
const BOX_SIZE = width / 10 - 5;

export default function DailyNumberDrawScreen({ navigation }) {
  const { user, refreshUser } = useContext(AuthContext);

  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [successModal, setSuccessModal] = useState(false);
  const [toast, setToast] = useState("");

  // animations
  const toastAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 🔥 SUBMIT BUTTON PULSATING
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.07,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 🔥 Toast
  const showToast = (msg) => {
    setToast(msg);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 1500);
    });
  };

  // 🔢 Toggle numbers
  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num]);
    } else {
      showToast("You can’t select more than 5 numbers");
    }
  };

  // 🚀 Submit numbers
  const handleSubmit = async () => {
    if (selectedNumbers.length !== 5) return;

    setSubmitting(true);

    try {
      const res = await api.post("/daily-game/play", {
        numbers: selectedNumbers,
      });

      if (res.data.success) {
        await refreshUser(); // reload user to get updated tickets
        setSuccessModal(true);
        setSelectedNumbers([]);
      } else {
        showToast(res.data.message || "Something went wrong");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to submit. Try again.");
    }

    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Daily Number Draw</Text>
        <View />
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <Text style={styles.subText}>
          Select 5 lucky numbers (1–70).{"\n"}
          Each play uses **1 ticket**. You can play unlimited times!
        </Text>

        {/* Tickets */}
        <View style={styles.ticketRow}>
          <Ionicons name="ticket-outline" size={22} color="#FF8C00" />
          <Text style={styles.ticketText}>{user?.tickets || 0} Tickets Left</Text>
        </View>

        <Text style={styles.chooseText}>Choose 5 numbers</Text>

        {/* GRID */}
        <View style={styles.grid}>
          {Array.from({ length: 70 }, (_, i) => i + 1).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.numberBox,
                selectedNumbers.includes(num) && styles.selectedBox,
              ]}
              onPress={() => toggleNumber(num)}
            >
              <Text
                style={[
                  styles.numberText,
                  selectedNumbers.includes(num) && styles.selectedText,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBMIT */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            alignSelf: "center",
            width: "60%",
          }}
        >
          <TouchableOpacity
            style={[
              styles.submitButton,
              selectedNumbers.length === 5 && styles.submitActive,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* SUCCESS MODAL */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={65} color="#4CD964" />
            <Text style={styles.modalTitle}>Submitted!</Text>
            <Text style={styles.modalSubtitle}>
              Check results at 7:00pm daily.
            </Text>

            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.okText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TOAST */}
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: toastAnim,
            transform: [
              {
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    justifyContent: "space-between",
  },

  title: {
    color: "#FF8C00",
    fontSize: 22,
    fontWeight: "800",
  },

  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
  },

  subText: {
    fontSize: 13.5,
    color: "#000",
    lineHeight: 19,
    textAlign: "center",
  },

  ticketRow: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 10,
    alignItems: "center",
  },

  ticketText: {
    marginLeft: 8,
    fontWeight: "700",
    color: "#000",
    fontSize: 15,
  },

  chooseText: {
    textAlign: "center",
    marginVertical: 12,
    fontSize: 14,
    color: "#666",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  numberBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: { fontSize: 14, color: "#000" },

  selectedBox: {
    backgroundColor: "#FF8C00",
    borderColor: "#FF8C00",
  },

  selectedText: { color: "#fff", fontWeight: "bold" },

  submitButton: {
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 30,
  },

  submitActive: {
    backgroundColor: "#FF8C00",
  },

  submitText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "#fff",
    width: "75%",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 35,
  },

  modalTitle: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: "700",
    color: "#000",
  },

  modalSubtitle: {
    color: "#555",
    marginBottom: 20,
    marginTop: 5,
  },

  okButton: {
    backgroundColor: "#FF8C00",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 25,
  },

  okText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  toast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },

  toastText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
