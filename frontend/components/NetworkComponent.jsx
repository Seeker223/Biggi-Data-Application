import React, { useState } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';

// Dummy Data for Network Operators
// NOTE: Replace 'require(...)' with your actual image paths in your assets folder
const NETWORKS = [
    { id: 'MTN', name: 'MTN', logo: require('../../assets/mtn_logo.png') }, // Placeholder
    { id: 'AIRTEL', name: 'Airtel', logo: require('../../assets/airtel_logo.png') }, // Placeholder
    { id: 'GLO', name: 'Glo', logo: require('../../assets/glo_logo.png') }, // Placeholder
    { id: '9MOBILE', name: '9mobile', logo: require('../../assets/9mobile_logo.png') }, // Placeholder
];

// Component for a single network option
const NetworkOption = ({ network, isSelected, onSelect }) => {
    return (
        <Pressable
            onPress={() => onSelect(network.id)}
            className={`flex-row items-center bg-white p-4 mb-4 rounded-xl border-2 
                ${isSelected ? 'border-[#FF8000]' : 'border-gray-200'}`}
        >
            {/* Logo Container */}
            <View className="w-16 h-16 mr-6 justify-center items-center">
                {/* NOTE: In a real app, you might use a better way to handle different logo aspect ratios, 
                    but we use resizeMode="contain" here for safety.
                */}
                <Image
                    source={network.logo}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>

            {/* Network Name */}
            <Text className="text-black text-xl font-medium">{network.name}</Text>
        </Pressable>
    );
};


const NetworkSelectionComponent = () => {
    // State to track the currently selected network
    const [selectedNetwork, setSelectedNetwork] = useState('MTN'); // Default to MTN as per the image

    const handleNetworkSelect = (id) => {
        setSelectedNetwork(id);
        Alert.alert('Network Selected', `You chose: ${id}`);
    };

    return (
        // The container here is a simple wrapper. You would integrate this 
        // into a larger screen component with its own background/padding.
        <View className="w-full p-4 bg-white">
            {NETWORKS.map((network) => (
                <NetworkOption
                    key={network.id}
                    network={network}
                    isSelected={selectedNetwork === network.id}
                    onSelect={handleNetworkSelect}
                />
            ))}
        </View>
    );
};

export default NetworkSelectionComponent;