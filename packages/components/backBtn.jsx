import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'
import { ArrowLeftOutlined } from '@ant-design/icons'

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
          gap: 6,
        },
        style,
      ]}
    >
      <ArrowLeftOutlined 
        style={{ 
          fontSize: 16, 
          color: '#FF8C00',
          fontWeight: 'bold'
        }} 
      />
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
    </TouchableOpacity>
  )
}

