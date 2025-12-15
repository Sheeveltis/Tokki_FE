import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * ScoreResult: Hiển thị kết quả điểm
 */
export function ScoreResult({ score, total, onFinish }) {
  const percentage = Math.round((score / total) * 100)

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>
        Điểm: {score} / {total}
      </Text>
      <Text style={styles.percentageText}>
        ({percentage}%)
      </Text>
      <Pressable style={styles.button} onPress={onFinish}>
        <Text style={styles.buttonText}>Hoàn thành</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#79964E',
    borderRadius: 8,
    shadowColor: '#79964E',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

