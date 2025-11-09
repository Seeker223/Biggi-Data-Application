import React from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import images from '../constants/images';

const SplashComponent = () => (
  <LinearGradient
    colors={['#000000', '#202327', '#000000']}
    locations={[0, 0.476, 1]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.container}
  >
    <Image source={images.biggiData1} resizeMode="contain" style={styles.logo} />
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#FF8000" />
    </View>

    <View style={styles.titleRow}>
      <Text style={styles.biggiText}>Biggi Data</Text>
      <MaterialCommunityIcons name="star-four-points" size={24} color="#FF8000" />
    </View>

    <Text style={styles.rewardText}>
      Biggi {'\n'}Reward
    </Text>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 395, height: 395 },
  loader: { justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  titleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  biggiText: { color: '#FF8000', fontSize: 40, fontWeight: '800', marginRight: 8 },
  rewardText: { color: '#fff', textAlign: 'center', fontSize: 40, fontWeight: '800', width: 263, height: 129, marginTop: 10 },
});

export default SplashComponent;
