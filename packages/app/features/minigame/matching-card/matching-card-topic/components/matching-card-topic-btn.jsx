import React from 'react'
import { Pressable, StyleSheet, Text, Platform } from 'react-native'

/**
 * Nút xác nhận chọn chủ đề cho matching-card
 */
export function MatchingCardTopicButton({ label = 'Xác nhận', onPress, style, textStyle }) {
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
    paddingHorizontal: 24,
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

export default MatchingCardTopicButton


