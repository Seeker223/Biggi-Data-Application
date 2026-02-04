import { View, Text, Pressable, TextInput } from 'react-native'
import React, { useState } from 'react'

import { Link } from 'expo-router';

const SignUpComponent = () => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [mobile, setMobile] = useState('');
        const [birth, setBirth] = useState('');
        const [password, setPassword] = useState('');
        const [passwordconfirm, setPasswordconfirm] = useState('');
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
        const handleSignup = () => {
            console.log('Navigating to Sign Up...');
            // Add navigation logic here
        };
  return (
    <View 
    style={{
              marginTop:'',
              position: 'relative',
              width: '90%',
              height:'100%'
            }}
    className='items-center justify-center'>
            <View>
                <Text className='font-semibold'>Fullb Name</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your name"
                    placeholderTextColor="#9ca3af"
                    keyboardType="name"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                            
                            </View>
                           
            
            </View>
            <View>
                <Text className='font-semibold'>Email</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                            
                            </View>
                           
            
            </View>
            <View>
                <Text className='font-semibold'>Mobile Number</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={mobile}
                    onChangeText={setMobile}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="+ 123 456 789"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                            
                            </View>
                           
            
            </View>
            <View>
                <Text className='font-semibold'>Date of Birth</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={birth}
                    onChangeText={setBirth}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="DD/ MM / YYY"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                            
                            </View>
                           
            
            </View>
            <View>
                <Text className='font-semibold'>Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="**********"
                    placeholderTextColor="#9ca3af"
                    keyboardType="default"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                {/* Eye-Pass Toggle Icon */}
                            <Pressable 
                            style= {{ position: 'absolute', right: 20 }}
                                className="justify-center items-center"
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                <Text className="text-lg text-gray-600">
                                    {isPasswordVisible ? '🔒' : '👁️'}
                                </Text>
                            </Pressable>
                            </View>
                           
            
            </View>
            {/* Password Input */}
            <View>
                <Text className='font-semibold'>Confirm Password</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center',}}>
                <TextInput
                    value={passwordconfirm}
                    onChangeText={setPasswordconfirm}
                    secureTextEntry={!isPasswordVisible}
                    className="h-12 w-full px-4 text-gray-900 border border-gray-300 rounded-[20px] text-base bg-[#E2E2E2] // Focus state focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="**********"
                    placeholderTextColor="#9ca3af"
                    keyboardType="password"
                    // NOTE: Change keyboardType to 'default' for password fields, 
                    // or remove it, as 'email-address' is confusing here.
                />
                {/* Eye-Pass Toggle Icon */}
                            <Pressable 
                            style= {{ position: 'absolute', right: 20 }}
                                className="justify-center items-center"
                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                            >
                                <Text className="text-lg text-gray-600">
                                    {isPasswordVisible ? '🔒' : '👁️'}
                                </Text>
                            </Pressable>
                            </View>
                           
            
            </View>
            <View 
            className=" items-center justify-center">

                <Text className='font-normal text-sm leading-[13px] text-center text-black'>
                  By continuing, you agree to 
 
                  </Text>
                <Text
                style={{
                  lineHeight:'5rem'
                }} 
                className=' font-normal text-sm leading-[13px] text-center text-black'>
                  Terms of Use and Privacy Policy.
                  </Text>

            {/* Sign Up BUTTON (Primary Button Style) */}
            <Pressable 
            className='w-[207px] h-[45px] mb-6 items-center justify-center p-4 rounded-[30px] bg-black'
            onPress={handleSignup}>
                <Link href='/(auth)/signUp'>
                <Text className="  text-white text-xl font-bold">
                    Sign Up
                </Text>
                </Link>
            </Pressable>

                    {/* Don't have an account? Sign Up */}
                    <Text 
                    style={{
                        paddingTop:'6rem'
                    }}
                    className="font-light text-sm text-center text-black">
                        Already have an account? 
                         <Link href='/(auth)/login'>
                        <Text className="font-medium text-[#FF8000]">
                            Login 
                        </Text>
                        </Link>
                    </Text>
</View>
            
            
</View>
  )
}

export default SignUpComponent