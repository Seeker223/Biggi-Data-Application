import { View, Text, Button } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const withDrawScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 24 }}>withdraw page</Text>
          <Link href="/home" asChild>
            <Button title="Go Back Home" />
          </Link>
        </View>
  )
}

export default withDrawScreen