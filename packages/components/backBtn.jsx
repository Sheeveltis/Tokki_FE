import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'

/**
 * Back Button Component
 * - Text "Quay lại" with left arrow in orange color
 * - Clickable button that navigates back
 *
 * @param {{
 *   onPress?: () => void;
 *   style?: any;
 *   textStyle?: any;
 * }} props
 */
export const BackButton = ({ onPress, style, textStyle }) => {
  const router = useRouter()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.back()
    }
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
        Quay lại
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
        ←
      </Text>
    </TouchableOpacity>
  )
}

