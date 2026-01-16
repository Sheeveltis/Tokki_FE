import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * InstructionsBox: Hộp hướng dẫn
 */
export function InstructionsBox({ title = 'Hướng dẫn:', instructions }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{instructions}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Epilogue, sans-serif',
  },
})

