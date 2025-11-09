import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({
  title,
  onPress,
  bgColor = "#2563EB", // Tailwind's blue-600
  textColor = "#FFFFFF",
  activeBgColor = "#1E40AF", // Tailwind's blue-700
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.button, { backgroundColor: bgColor }, style]}
      // Change background on press manually if you want fancier feedback later
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    backgroundColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});


// // CustomButton.jsx
// import { TouchableOpacity, Text } from 'react-native';
// import React from 'react';
// import { Alert } from 'react-native'; // Import Alert for a demo action

// const CustomButton = ({ 
//     title, 
//     onPress, 
//     className = "",
//     // Define props for background and text color
//     bgColor = "bg-blue-600", // Default to Tailwind blue-600 class
//     textColor = "text-white", // Default to white text class
//     // Prop for active/press state style (e.g., darker background)
//     activeBgColor = "bg-blue-700" 
// }) => {
  
//   // 💡 FIX: We use arbitrary value notation [ ] for the background and text color 
//   // to ensure NativeWind correctly processes custom color hex codes or Tailwind classes.
//   // We also use the 'active:' prefix on the primary color class for press feedback.
  
//   return (
//     <TouchableOpacity
//       // Construct the dynamic class string:
//       // 1. Primary background/text color from props
//       // 2. Add the dynamic active state class (active:bg-...)
//       // 3. Apply standard styling (padding, rounded, shadow)
//       // 4. Append any external classes passed via the 'className' prop
//       className={`
//         ${bgColor} ${textColor}
//         active:${activeBgColor}
//         px-8   rounded-full shadow-lg 
//         ${className} 
//       `}
//       onPress={onPress}
//       activeOpacity={0.7} // Control the opacity change when pressed
//     >
//       <Text 
//         className={`
//           ${textColor} 
//           text-xl  font-bold text-center 
//         `}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// };

// export default CustomButton;

// import {  Text, TouchableOpacity, View } from 'react-native';
// import React from 'react';

// const CustomButton = ({ title, onPress, className = "" }) => {
//   return (
//     <>
//     <View className='justify-center items-center'>
//     <TouchableOpacity 
//       className={`
//         w-[207px] h-[45px] mb-6 items-center justify-center p-4 rounded-[30px] 
        
//         active:bg-green-600 active:shadow-md
//         ${className} 
//       `}
//       onPress={onPress}
//     >
//       <Text className="text-white text-xl font-bold text-center">
//         {title}
//       </Text>
//     </TouchableOpacity>
//     </View>
//     </>
//   );
// };

// export default CustomButton;