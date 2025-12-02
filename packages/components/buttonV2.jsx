import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

/**
 * Button V2 color palette
 */
export const BUTTON_V2_COLORS = {
  charcoal: '#373039',
  sage: '#BDAAAC', // RGB: 141, 170, 160
  mint: '#BCD0CA',
  blush: '#F2CFC2',
  poppy: '#F87218',
  ivory: '#F2EBE6',
}

/**
 * Button V2 component with 6 predefined color options
 * Automatically adjusts text color based on background brightness
 *
 * @param {{
 *   title: string;
 *   onPress?: () => void;
 *   color?: keyof typeof BUTTON_V2_COLORS | string;
 *   disabled?: boolean;
 *   style?: any;
 *   textStyle?: any;
 *   fullWidth?: boolean;
 * }} props
 */
export const ButtonV2 = ({
  title,
  onPress,
  color = 'charcoal',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  // Get color from palette or use custom color
  const backgroundColor =
    typeof color === 'string' && BUTTON_V2_COLORS[color]
      ? BUTTON_V2_COLORS[color]
      : color || BUTTON_V2_COLORS.charcoal

  // Determine text color based on background brightness
  // Light colors (ivory, blush, mint) use dark text, others use white
  const isLightColor =
    color === 'ivory' || color === 'blush' || color === 'mint'
  const textColor = isLightColor ? '#373039' : '#FFFFFF'

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
          borderRadius: 0,
          paddingVertical: 14,
          paddingHorizontal: 14,
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: fullWidth ? '100%' : 200,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, // For Android
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: disabled ? '#666666' : textColor,
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Epilogue, sans-serif',
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

