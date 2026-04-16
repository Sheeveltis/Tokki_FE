import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PronunciationRuleCard } from './PronunciationRuleCard'

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
        <PronunciationRuleCard
          key={String(rule.id)}
          rule={rule}
          onPress={() => onSelectRule?.(rule)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
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
