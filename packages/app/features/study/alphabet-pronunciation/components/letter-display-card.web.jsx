import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * LetterDisplayCard: Hiển thị chữ cái lớn với thông tin
 */
export function LetterDisplayCard({ letter, meaning, pronunciation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.letter}>{letter || ''}</Text>
        <Text style={styles.meaning}>{meaning || ''}</Text>
        {pronunciation && (
          <Text style={styles.pronunciation}>[{pronunciation}]</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    borderWidth: 4,
    borderColor: '#79964E',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  letter: {
    fontSize: 120,
    fontWeight: '700',
    color: '#79964E',
    fontFamily: 'Epilogue, sans-serif',
  },
  meaning: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  pronunciation: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})

