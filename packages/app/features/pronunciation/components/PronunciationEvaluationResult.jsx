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

  const { score, accuracyScore, fluencyScore, completenessScore, aiFeedback } = result

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kết quả đánh giá AI</Text>
      
      <View style={styles.scoreGrid}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Tổng điểm</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>{score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Độ chính xác</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(accuracyScore) }]}>{accuracyScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Độ trôi chảy</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(fluencyScore) }]}>{fluencyScore}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>Độ đầy đủ</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(completenessScore) }]}>{completenessScore}</Text>
        </View>
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>Nhận xét từ Tokki:</Text>
        <Text style={styles.feedbackText}>{aiFeedback}</Text>
      </View>
    </View>
  )
}

const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50'
  if (score >= 50) return '#FF9800'
  return '#F44336'
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 12,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#34495E',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
    fontWeight: '500',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
})

export default PronunciationEvaluationResult
