import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'

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
  const router = useRouter()

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push('/payment/premium')
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

