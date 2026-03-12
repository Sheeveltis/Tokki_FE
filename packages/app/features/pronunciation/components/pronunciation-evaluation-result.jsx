import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function PronunciationEvaluationResult({ result }) {
  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có kết quả đánh giá</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả đánh giá</Text>
      <Text style={styles.score}>Điểm: {typeof result.score === 'number' ? result.score : 'N/A'}</Text>
      <Text style={styles.feedback}>{result.feedback || 'Không có nhận xét'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  score: {
    marginTop: 6,
    fontSize: 13,
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  feedback: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})

export default PronunciationEvaluationResult
