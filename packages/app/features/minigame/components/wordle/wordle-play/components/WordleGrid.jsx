import { StyleSheet, ImageBackground } from 'react-native'
import { WordleRow } from './WordleRow'
import { WordleInputRow } from './WordleInputRow'
import BackgroundColumn from '../../../../../../../assets/BackgroundColumn.png'

// rows: mảng các feedbacks từ API, mỗi phần tử là một mảng feedback cho 1 lượt đoán
export function WordleGrid({
  rows = [],
  maxGuesses = 6,
  currentPage = 0,
  wordLength = 5,
  gridCells = [],
  gameState = 'playing',
  onCellClick,
  activeColIndex = 0,
  level = 1,
}) {
  const renderedRows = []
  const currentRowIndex = rows.length
  const PAGE_SIZE = 6

  for (let i = 0; i < PAGE_SIZE; i++) {
    const rowIndex = currentPage * PAGE_SIZE + i

    if (rowIndex < maxGuesses) {
      if (rowIndex === currentRowIndex && gameState === 'playing') {
        renderedRows.push(
          <WordleInputRow
            key={rowIndex}
            gridCells={gridCells}
            length={wordLength}
            onCellClick={onCellClick}
            activeIndex={activeColIndex}
          />
        )
      } else {
        renderedRows.push(
          <WordleRow
            key={rowIndex}
            feedbacks={rows[rowIndex]}
            length={wordLength}
          />
        )
      }
    } else {
      // Hàng bị khóa (vượt quá maxGuesses)
      renderedRows.push(
        <WordleRow
          key={rowIndex}
          length={wordLength}
          isLocked={true}
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



