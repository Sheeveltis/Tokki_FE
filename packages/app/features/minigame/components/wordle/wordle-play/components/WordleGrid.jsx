import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WordleRow } from './WordleRow'

export function WordleGrid({ guesses, statuses, maxGuesses = 6, wordLength = 5 }) {
  const rows = []

  for (let i = 0; i < maxGuesses; i++) {
    rows.push(
      <WordleRow
        key={i}
        guess={guesses[i] || ''}
        statuses={statuses[i]}
        length={wordLength}
      />
    )
  }

  return (
    <View style={styles.grid}>
      {rows}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    paddingVertical: 20,
    gap: 5,
  },
})



