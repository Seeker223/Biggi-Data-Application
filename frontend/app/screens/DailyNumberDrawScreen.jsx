// screens/DailyNumberDrawScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DailyNumberDrawScreen = ({ navigation }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [successVisible, setSuccessVisible] = useState(false);

  const toggleNumber = (num) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 5) {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const handleSubmit = () => {
    if (selectedNumbers.length === 5) {
      setSuccessVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Daily Number Draw</Text>
      <Text style={styles.desc}>
        Select 5 numbers between 1 and 70 for your daily chance to win!{"\n"}
        <Text style={styles.bold}>Every data bundle you buy gives you a ticket to play</Text>{"\n"}
        You can play as many times as you want.{"\n"}
        The more you play, the higher your chances of winning in today’s draw!
      </Text>

      <View style={styles.sectionHeader}>
        <Ionicons name="star-outline" size={20} color="#FF8C00" />
        <Text style={styles.sectionTitle}>Select Numbers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {[...Array(70)].map((_, i) => {
          const num = i + 1;
          const isSelected = selectedNumbers.includes(num);
          return (
            <TouchableOpacity
              key={num}
              style={[styles.numberBox, isSelected && styles.selectedBox]}
              onPress={() => toggleNumber(num)}
            >
              <Text
                style={[styles.numberText, isSelected && styles.selectedText]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.submitButton,
          selectedNumbers.length < 5 && styles.disabledButton,
        ]}
        disabled={selectedNumbers.length < 5}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        <Text style={styles.noteBold}>Note:</Text> Results will be out by 7:00 pm{"\n"}
        Refer to the results checker tab
      </Text>

      {/* ✅ Success Modal */}
      <Modal
        visible={successVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="checkmark-circle" size={70} color="#00C851" />
            <Text style={styles.modalTitle}>Success</Text>
            <Text style={styles.modalMessage}>Check back later</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessVisible(false);
                nnavigation.navigate("(tabs)/homeScreen");
              }}
            >
              <Text style={styles.modalButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DailyNumberDrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#FF8C00",
    textAlign: "center",
    marginTop: 20,
  },
  desc: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 10,
  },
  bold: {
    fontFamily: "Poppins-SemiBold",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 5,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
    backgroundColor: 'white',
    borderRadius: 17,
  
  },
  numberBox: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
  },
  selectedBox: {
    backgroundColor: "#FF8C00",
    borderColor: "#FF8C00",
  },
  numberText: {
    color: "#777",
    fontFamily: "Poppins-Regular",
  },
  selectedText: {
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  submitButton: {
    backgroundColor: "#FF8C00",
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  note: {
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#fff",
    fontSize: 12,
  },
  noteBold: {
    color: "#FF8C00",
    fontFamily: "Poppins-SemiBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#000",
    marginVertical: 10,
  },
  modalMessage: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#FF8C00",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    width: "70%",
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
});
