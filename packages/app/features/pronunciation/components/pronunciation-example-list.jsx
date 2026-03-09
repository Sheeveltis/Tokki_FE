import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FlashcardTopicCard } from '../../study/components/shared'

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
        <FlashcardTopicCard
          key={String(example.id)}
          icon={
            <View style={styles.numberIcon}>
              <Text style={styles.numberText}>{example.sortOrder}</Text>
            </View>
          }
          title={example.text || 'Không có nội dung'}
          subtitle="Luyện tập phát âm"
          progress={0}
          compact={true}
          showBadge={false}
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
  numberIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#7FB069', 
    alignItems: 'center', justifyContent: 'center',
  },
  numberText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', fontFamily: 'Epilogue, sans-serif' },
})

export default PronunciationExampleList