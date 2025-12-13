import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * ScoreDisplay: Hiển thị điểm số
 */
export function ScoreDisplay({ score = 0, attempts = 0 }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{score} / {attempts}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

