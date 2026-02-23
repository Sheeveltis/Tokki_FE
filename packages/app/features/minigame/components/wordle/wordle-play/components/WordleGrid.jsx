import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WordleRow } from './WordleRow'
import { WordleTargetRow } from './WordleTargetRow'
import { WordleInputRow } from './WordleInputRow'

// rows: mảng các feedbacks từ API, mỗi phần tử là một mảng feedback cho 1 lượt đoán
export function WordleGrid({ rows = [], maxGuesses = 6, wordLength = 5, targetWord = '', currentGuess = '', jamoSequences = [], gameState = 'playing', onCellClick }) {
  const renderedRows = []
  const currentRowIndex = rows.length

  for (let i = 0; i < maxGuesses; i++) {
    // Nếu là row hiện tại đang nhập và gameState === 'playing', hiển thị input row
    if (i === currentRowIndex && gameState === 'playing') {
      renderedRows.push(
        <WordleInputRow
          key={i}
          currentGuess={currentGuess}
          jamoSequences={jamoSequences}
          length={wordLength}
          onCellClick={onCellClick}
        />
      )
    } else {
      renderedRows.push(
      <WordleRow
        key={i}
          feedbacks={rows[i]}
        length={wordLength}
      />
    )
    }
  }

  return (
    <View style={styles.grid}>
      <WordleTargetRow wordLength={wordLength} targetWord={targetWord} />
      {renderedRows}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    paddingVertical: 10,
    gap: 3,
  },
})



