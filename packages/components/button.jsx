import React, { useState } from 'react'
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
 *   disabledColor?: string;
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
  disabledColor = '#CCCCCC',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const [pressed, setPressed] = useState(false)

  // Get color from palette or use custom color
  const baseColor =
    typeof color === 'string' && BUTTON_COLORS[color]
      ? BUTTON_COLORS[color]
      : color || BUTTON_COLORS.darkGreen

  const backgroundColor = pressed
    ? // khi nhấn: làm màu đậm hơn một chút
      shadeColor(baseColor, -10)
    : baseColor

  function shadeColor(hex, percent) {
    if (typeof hex !== 'string') return hex
    let c = hex.replace('#', '')
    if (c.length === 3) {
      c = c
        .split('')
        .map((ch) => ch + ch)
        .join('')
    }
    const num = parseInt(c, 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    const clamp = (v) => Math.max(0, Math.min(255, v))
    return (
      '#' +
      (
        (1 << 24) +
        (clamp(R) << 16) +
        (clamp(G) << 8) +
        clamp(B)
      )
        .toString(16)
        .slice(1)
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
            backgroundColor: disabled ? disabledColor : backgroundColor,
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

