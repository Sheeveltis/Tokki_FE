import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * PronunciationDisplay: Hiển thị cách phát âm
 */
export function PronunciationDisplay({ pronunciation }) {
  if (!pronunciation) return null

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cách phát âm:</Text>
      <Text style={styles.text}>{pronunciation}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#FFF4E6',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
})

