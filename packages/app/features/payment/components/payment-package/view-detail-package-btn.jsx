import React from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { ArrowRightOutlined } from '@ant-design/icons'
// Import useNavigation cho native
let useNavigation = null
if (Platform.OS !== 'web') {
  try {
    const navigationModule = require('@react-navigation/native')
    useNavigation = navigationModule.useNavigation
  } catch (e) {
    // @react-navigation/native không có sẵn trên web
  }
}

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
  // Sử dụng navigation cho native, router cho web
  const navigation = useNavigation ? useNavigation() : null

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      if (Platform.OS === 'web') {
        router.push('/premium-package')
      } else {
        // Trên native, dùng React Navigation
        if (navigation) {
          navigation.navigate('premium-package')
        } else {
          // Fallback nếu navigation không có
          router.push('/premium-package')
        }
      }
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
      <ArrowRightOutlined 
        style={{ 
          fontSize: 16, 
          color: '#FF8C00',
          fontWeight: 'bold'
        }} 
      />
    </TouchableOpacity>
  )
}

