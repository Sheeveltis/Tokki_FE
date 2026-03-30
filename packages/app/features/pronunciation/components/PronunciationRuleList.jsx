import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FlashcardTopicCard } from '../../study/components/shared'

export function PronunciationRuleList({ rules, onSelectRule }) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có quy tắc phát âm</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {rules.map((rule) => (
        <FlashcardTopicCard
          key={String(rule.id)}
          icon={rule.icon || null}
          title={rule.title}
          subtitle={rule.description || 'Quy tắc phát âm tiếng Hàn'}
          progress={0}
          compact={false}
          showBadge={false}
          onPress={() => onSelectRule?.(rule)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '80%',
    maxWidth: '100%',
    gap: 30,
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})

export default PronunciationRuleList
