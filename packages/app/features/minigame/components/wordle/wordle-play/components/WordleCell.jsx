import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export function WordleCell({ letter, status }) {
  // status: 'correct' (green), 'present' (yellow), 'absent' (gray), 'empty' (default)
  let cellStyle = styles.cell
  let textStyle = styles.text

  if (status === 'correct') {
    cellStyle = [styles.cell, styles.correct]
    textStyle = [styles.text, styles.whiteText]
  } else if (status === 'present') {
    cellStyle = [styles.cell, styles.present]
    textStyle = [styles.text, styles.whiteText]
  } else if (status === 'absent') {
    cellStyle = [styles.cell, styles.absent]
    textStyle = [styles.text, styles.whiteText]
  }

  return (
    <View style={cellStyle}>
      <Text style={textStyle}>{letter}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#d3d6da',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  correct: {
    backgroundColor: '#6aaa64',
    borderColor: '#6aaa64',
  },
  present: {
    backgroundColor: '#c9b458',
    borderColor: '#c9b458',
  },
  absent: {
    backgroundColor: '#787c7e',
    borderColor: '#787c7e',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1b',
    textTransform: 'uppercase',
  },
  whiteText: {
    color: '#fff',
  },
})



