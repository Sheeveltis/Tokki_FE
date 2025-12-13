import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * LetterCard: Hiển thị thông tin chữ cái cần nhập
 */
export function LetterCard({ meaning, pronunciation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.meaning}>{meaning || ''}</Text>
        {pronunciation && (
          <Text style={styles.pronunciation}>[{pronunciation}]</Text>
        )}
        <Text style={styles.instruction}>Nhập chữ cái tương ứng</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 4,
    borderColor: '#79964E',
  },
  meaning: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  pronunciation: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  instruction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#79964E',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 8,
  },
})

