import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PronunciationExampleCard } from './PronunciationExampleCard'

export function PronunciationExampleList({ examples, onSelectExample }) {
  if (!Array.isArray(examples) || examples.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có ví dụ cho quy tắc này</Text>
      </View>
    )
  }

  // Sort đúng theo trường sortOrder
  const sortedExamples = [...examples].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <View style={styles.container}>
      {sortedExamples.map((example) => (
        <PronunciationExampleCard
          key={String(example.id)}
          sortOrder={example.sortOrder}
          text={example.text || 'Không có nội dung'}
          subtitle="Chạm để bắt đầu luyện tập"
          difficulty={example.difficulty}
          onPress={() => onSelectExample?.(example)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 16 },
  emptyContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16 },
  emptyText: { fontSize: 14, color: '#666', fontFamily: 'Epilogue, sans-serif' },
})

export default PronunciationExampleList