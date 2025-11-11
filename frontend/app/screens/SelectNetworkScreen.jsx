// screens/SelectNetworkScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const SelectNetworkScreen = () => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(null);

  const networks = [
    { id: 'mtn', name: 'MTN', logo: require('../../assets/images/mtn.png') },
    { id: 'airtel', name: 'Airtel', logo: require('../../assets/images/airtel.png') },
    { id: 'glo', name: 'Glo', logo: require('../../assets/images/glo.png') },
    { id: '9mobile', name: '9mobile', logo: require('../../assets/images/9mobile.png') },
  ];

  const handleSelect = (item) => {
    setSelected(item.id);
    setTimeout(() => {
      navigation.navigate('BuyData', { selectedNetwork: item.name });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Network</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {networks.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              selected === item.id && styles.cardSelected,
            ]}
            onPress={() => handleSelect(item)}
          >
            <Image source={item.logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.networkName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectNetworkScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  cardSelected: {
    borderColor: '#FF7A00',
    borderWidth: 1.5,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  networkName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#000',
  },
});
