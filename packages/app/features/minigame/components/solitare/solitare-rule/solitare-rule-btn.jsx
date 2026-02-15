import React from 'react'
import { Pressable, StyleSheet, Text, Platform } from 'react-native'

/**
 * Nút action cho trang rule solitaire
 * Có thể dùng để bắt đầu chơi hoặc chuyển màn, tuỳ props truyền vào.
 * @param {{ onPress?: () => void; label?: string; style?: any; textStyle?: any }} props
 */
export function SolitareRuleButton({ onPress, label = 'Chọn độ khó', style, textStyle }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7FA14D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
})

export default SolitareRuleButton


