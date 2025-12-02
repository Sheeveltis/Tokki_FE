import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

/**
 * Button color palette
 */
export const BUTTON_COLORS = {
  darkGreen: '#5E794C',
  lightGreen: '#88A455',
  dustyRose: '#DC9C9E',
  lightPink: '#EDC5C8',
  mustard: '#F1BE4B', // Goldenrod/mustard yellow
}

/**
 * Flexible button component with predefined color options
 *
 * @param {{
 *   title: string;
 *   onPress?: () => void;
 *   color?: keyof typeof BUTTON_COLORS | string;
 *   disabled?: boolean;
 *   style?: any;
 *   textStyle?: any;
 *   fullWidth?: boolean;
 * }} props
 */
export const Button = ({
  title,
  onPress,
  color = 'darkGreen',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  // Get color from palette or use custom color
  const backgroundColor =
    typeof color === 'string' && BUTTON_COLORS[color]
      ? BUTTON_COLORS[color]
      : color || BUTTON_COLORS.darkGreen

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: disabled ? '#CCCCCC' : backgroundColor,
          borderRadius: 100,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: fullWidth ? '100%' : 200,
          shadowColor: '#000',
          shadowOffset: {
            width: 2.5,
            height: 3,
          },
          shadowOpacity: 0.5,
          shadowRadius: 1,
          elevation: 3, // For Android
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'Epilogue, sans-serif',
            textAlign: 'center',
            letterSpacing: 0.75,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  )
}

