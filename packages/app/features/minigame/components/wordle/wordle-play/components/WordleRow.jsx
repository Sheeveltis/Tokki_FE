import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WordleCell } from './WordleCell'

export function WordleRow({ guess, statuses, length = 5 }) {
  const cells = []

  for (let i = 0; i < length; i++) {
    cells.push(
      <WordleCell
        key={i}
        letter={guess?.[i] || ''}
        status={statuses?.[i] || 'empty'}
      />
    )
  }

  return (
    <View style={styles.row}>
      {cells}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})



