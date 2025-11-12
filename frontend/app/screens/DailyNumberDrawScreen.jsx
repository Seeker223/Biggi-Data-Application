import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function DailyNumberDrawScreen() {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const showToast = () => {
    if (toastVisible) return;
    setToastVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastVisible(false));
      }, 1500);
    });
  };

  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num]);
    } else {
      showToast();
    }
  };

  const handleSubmit = () => {
    if (selectedNumbers.length === 5) {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text style={styles.title}>Daily Number Draw</Text>
      </View>

      {/* Curved White Body */}
      <View style={styles.body}>
        <Text style={styles.subText}>
          Select 5 numbers between 1 and 70 for your daily chance to win!{"\n"}
          <Text style={{ fontWeight: "bold" }}>
            Every data bundle you buy gives you a ticket to play
          </Text>
          {"\n"}You can play as many times as you want. The more you play, the
          higher your chances of winning!
        </Text>

        <View style={styles.sectionTitle}>
          <Ionicons name="star-outline" size={20} color="#FF8C00" />
          <Text style={styles.sectionText}>Select Numbers</Text>
        </View>

        <Text style={styles.chooseText}>Choose 5 numbers (1–70)</Text>

        {/* Numbers Grid */}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedNumbers.length === 5 && styles.submitActive,
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        {/* Note */}
        <Text style={styles.noteText}>
          <Text style={{ color: "#FF8C00", fontWeight: "bold" }}>Note:</Text>{" "}
          Results will be out by 7:00 pm{"\n"}
          <Text style={{ fontSize: 13 }}>
            Refer to the results checker tab
          </Text>
        </Text>
      </View>

      {/* Curved Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color="#4CD964"
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalSubtitle}>Check back later</Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.okText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Warning Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>
            You can’t select more than 5 numbers
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const BOX_SIZE = width / 10 - 5;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: "#FF8C00",
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 15,
  },
  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    marginTop: 10,
  },
  subText: {
    color: "#000",
    fontSize: 13.5,
    lineHeight: 18,
    textAlign: "left",
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  sectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginLeft: 6,
  },
  chooseText: {
    marginTop: 8,
    marginBottom: 10,
    fontSize: 13,
    color: "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 10,
  },
  numberBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    margin: 4,
  },
  numberText: { fontSize: 14, color: "#000" },
  selectedBox: { backgroundColor: "#FF8C00", borderColor: "#FF8C00" },
  selectedText: { color: "#fff", fontWeight: "bold" },
  submitButton: {
    alignSelf: "center",
    backgroundColor: "#eee",
    paddingVertical: 12,
    width: "60%",
    borderRadius: 25,
    marginTop: 10,
  },
  submitActive: {
    backgroundColor: "#FF8C00",
  },
  submitText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "600",
  },
  noteText: {
    textAlign: "center",
    color: "#000",
    marginTop: 8,
    fontSize: 14,
  },
  bottomNav: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "75%",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 5,
  },
  modalSubtitle: { color: "#555", fontSize: 14, marginBottom: 15 },
  okButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  okText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  toast: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  toastText: { color: "#fff", fontSize: 13, fontWeight: "500" },
});
