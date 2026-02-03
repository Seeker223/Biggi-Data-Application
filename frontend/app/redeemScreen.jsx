import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { TEMP_DISABLE_GAME_AND_REDEEM } from '../utils/api'
import { useRouter } from 'expo-router'

const RedeemScreen = () => {
  const router = useRouter();

  if (TEMP_DISABLE_GAME_AND_REDEEM) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Redeem Temporarily Disabled</Text>
        <Text style={styles.subtitle}>
          Reward redemption is temporarily disabled while we undergo Play Store review.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/') }>
          <Text style={styles.buttonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redeem</Text>
      <Text style={styles.subtitle}>Redeem functionality is enabled.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: '#FF7A00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '700' }
})

export default RedeemScreen

