import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WordleCell } from './WordleCell'

// feedbacks: mảng các object { character, blockColor, initialStatus, vowelStatus, finalStatus }
export function WordleRow({ feedbacks, length = 5, isLocked = false }) {
  const cells = []

  for (let i = 0; i < length; i++) {
    const fb = feedbacks?.[i] || null
    cells.push(
      <WordleCell
        key={i}
        feedback={fb}
        isLocked={isLocked}
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



