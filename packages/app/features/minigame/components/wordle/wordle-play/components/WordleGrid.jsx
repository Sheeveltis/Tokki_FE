import { StyleSheet, ImageBackground } from 'react-native'
import { WordleRow } from './WordleRow'
import { WordleInputRow } from './WordleInputRow'
import BackgroundColumn from '../../../../../../../assets/BackgroundColumn.png'

// rows: mảng các feedbacks từ API, mỗi phần tử là một mảng feedback cho 1 lượt đoán
export function WordleGrid({
  rows = [],
  maxGuesses = 6,
  wordLength = 5,
  gridCells = [],
  gameState = 'playing',
  onCellClick,
  activeColIndex = 0,
  level = 1,
}) {
  const renderedRows = []
  const currentRowIndex = rows.length

  for (let i = 0; i < maxGuesses; i++) {
    // Nếu là row hiện tại đang nhập và gameState === 'playing', hiển thị input row
    if (i === currentRowIndex && gameState === 'playing') {
      renderedRows.push(
        <WordleInputRow
          key={i}
          gridCells={gridCells}
          length={wordLength}
          onCellClick={onCellClick}
          activeIndex={activeColIndex}
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

  const getGridMinWidthByLevel = () => {
    if (level === 1) return 200
    if (level === 2) return 250
    return 310
  }

  return (
    <ImageBackground
      source={BackgroundColumn}
      style={[styles.grid, { minWidth: getGridMinWidthByLevel() }]}
      resizeMode="stretch"
    >
      {renderedRows}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  grid: {
    paddingVertical: 40,
    paddingHorizontal: 15,
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',

  },
})



