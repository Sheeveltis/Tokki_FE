import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

/**
 * View Detail Package Button Component
 * - Text "Xem chi tiết các gói" with right arrow in orange color
 * - Clickable button for viewing package details
 *
 * @param {{
 *   onPress?: () => void;
 *   style?: any;
 *   textStyle?: any;
 * }} props
 */
export const ViewDetailPackageButton = ({ onPress, style, textStyle }) => {
  const handlePress = () => {
    if (onPress) {
      onPress()
    }
    // Link navigation will be implemented later
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#FF8C00',
            fontFamily: 'Epilogue, sans-serif',
          },
          textStyle,
        ]}
      >
        Xem chi tiết các gói
      </Text>
      <Text
        style={[
          {
            fontSize: 18,
            fontWeight: '500',
            color: '#FF8C00',
          },
          textStyle,
        ]}
      >
        →
      </Text>
    </TouchableOpacity>
  )
}

