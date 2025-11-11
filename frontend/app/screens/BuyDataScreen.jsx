// screens/BuyDataScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BuyDataScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState(null);
  const [plan, setPlan] = useState(null);
  const [price, setPrice] = useState(1500);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Phone Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#777"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity style={styles.contactRow}>
          <Text style={styles.contactText}>Select from Contacts</Text>
          <Ionicons name="person-add-outline" size={18} color="#000" />
        </TouchableOpacity>

        {/* Select Network */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => navigation.navigate('screens/SelectNetworkScreen')}
        >
          <Text style={styles.dropdownText}>
            {network ? network : 'Network'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        {/* Select Data Plan */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => navigation.navigate('screens/SelectPlanScreen')}
        >
          <Text style={styles.dropdownText}>
            {plan ? plan : 'Select Data Plan'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#000" />
        </TouchableOpacity>

        {/* Pay Button */}
        <TouchableOpacity style={styles.payButton}>
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>

        {/* Price */}
        <Text style={styles.price}>₦{price.toLocaleString()}</Text>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home" size={22} color="#FF7A00" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="document-text-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BuyDataScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  headerRow: {
    marginTop: 10,
  },
  form: {
    marginTop: 30,
  },
  inputRow: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  contactText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  dropdown: {
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
  },
  payButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  payText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
  },
  price: {
    marginTop: 10,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F3F3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});
