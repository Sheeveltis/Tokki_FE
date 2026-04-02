import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * CheckButton: Nút kiểm tra đáp án
 */
export function CheckButton({ onPress, disabled = false }) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>Kiểm tra</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 500,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#79964E',
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(121, 150, 78, 0.3)',
      },
      default: {
        shadowColor: '#79964E',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

