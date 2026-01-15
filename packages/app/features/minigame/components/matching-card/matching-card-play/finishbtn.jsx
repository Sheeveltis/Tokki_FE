import React from 'react'
import { Pressable, StyleSheet, Text, Platform } from 'react-native'

/**
 * Nút kết thúc game (màu đỏ)
 * @param {{ onPress?: () => void }} props
 */
export function FinishButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.text}>Kết thúc</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#E2554E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

