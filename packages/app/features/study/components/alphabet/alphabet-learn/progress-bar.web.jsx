import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * ProgressBar: Thanh tiến độ học tập
 */
export function ProgressBar({ learned, total, progress }) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.text}>
        {learned} / {total} chữ đã học ({progress}%)
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  bar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#79964E',
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

