import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Data for Data Plans
const DATA_PLANS = [
    { id: '1GB', volume: '1GB', price: '₦600', validity: '30 Days' },
    { id: '2GB', volume: '2GB', price: '₦1200', validity: '30 Days' },
    { id: '3GB', volume: '3GB', price: '₦1800', validity: '30 Days' },
    { id: '4GB', volume: '4GB', price: '₦2400', validity: '30 Days' },
];

// Component for a single Data Plan option
const DataPlanOption = ({ plan, isSelected, onSelect }) => {
    return (
        <Pressable
            onPress={() => onSelect(plan.id)}
            className={`flex-row items-center justify-center bg-white p-4 mb-4 rounded-xl border-2 
                ${isSelected ? 'border-[#FF8000]' : 'border-gray-300'}`}
        >
            {/* Display format: Volume - Price (Validity) */}
            <Text className="text-black text-xl font-medium">
                {plan.volume} - <Text className="font-bold">{plan.price}</Text> ({plan.validity})
            </Text>
        </Pressable>
    );
};


const DataPlanSelectionComponent = () => {
    // State to track the currently selected data plan
    const [selectedPlan, setSelectedPlan] = useState('1GB'); // Default to 1GB as per the image
    const [searchText, setSearchText] = useState('');

    const handlePlanSelect = (id) => {
        setSelectedPlan(id);
        Alert.alert('Plan Selected', `You chose the ${id} plan.`);
    };

    return (
        // The container uses padding and a transparent background, 
        // assuming it's placed inside a larger screen's white card.
        <View className="w-full px-6 py-4 bg-white">
            
            {/* Search Input */}
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-2 mb-6">
                <Feather name="search" size={20} color="#9ca3af" className="mr-2" />
                <TextInput
                    placeholder="Search |"
                    placeholderTextColor="#9ca3af"
                    value={searchText}
                    onChangeText={setSearchText}
                    className="flex-1 text-black text-lg"
                />
            </View>

            {/* Data Plan List */}
            {DATA_PLANS.map((plan) => (
                <DataPlanOption
                    key={plan.id}
                    plan={plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={handlePlanSelect}
                />
            ))}
        </View>
    );
};

export default DataPlanSelectionComponent;