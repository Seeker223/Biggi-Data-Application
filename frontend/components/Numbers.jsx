import { View, Text } from 'react-native'
import React from 'react'

const Numbers = () => {
  return (
    <View 
                            className='border border-2 '
                            style={{width: 40,         // Must be equal to height
                            height: 40,        // Must be equal to width
                            // 💡 The key property is 'borderRadius'
                            borderRadius: 40,    // You can use a value > 50% of the width (e.g., half the width, 40)
                                        // OR, you can use a string '50%'
                            // borderRadius: '50%', // This also works in modern React Native versions
                            justifyContent: 'center',

                            alignItems: 'center',}}>
                            <Text className='font-bold '>1</Text>
                            </View>
  )
}

export default Numbers