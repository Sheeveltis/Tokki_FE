import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

const INPUT_ROW_CSS = `
.wordle-cell-pressable:focus,
.wordle-cell-pressable:focus-visible {
  outline: none;
}

.wordle-hidden-input,
.wordle-hidden-input:focus,
.wordle-hidden-input:focus-visible {
  outline: none;
}
`

/**
 * Row hiển thị currentGuess đang được nhập
 * Cho phép click vào từng cell để focus và nhập
 * gridCells: mảng các ký tự Hangul đã ghép cho mỗi ô (từ cellToDisplay)
 * activeIndex: index ô đang được focus (do parent control)
 */
export function WordleInputRow({ gridCells = [], length = 5, onCellClick, activeIndex }) {
  const cells = []

  // Nếu parent không truyền activeIndex thì fallback: chọn ô trống đầu tiên
  let effectiveActiveIndex = typeof activeIndex === 'number' ? activeIndex : 0
  if (typeof activeIndex !== 'number') {
    let foundEmpty = false
    for (let i = 0; i < length; i++) {
      const ch = gridCells[i] || ''
      if (!ch && !foundEmpty) {
        effectiveActiveIndex = i
        foundEmpty = true
        break
      }
    }
    if (!foundEmpty) {
      // Tất cả ô trước đó đều có ít nhất 1 jamo → active ở ô tiếp theo
      effectiveActiveIndex = Math.min(jamoSequences.length, length - 1)
    }
  }

  for (let i = 0; i < length; i++) {
    const displayText = gridCells[i] || ''
    const isActive = i === effectiveActiveIndex // Ô đang được focus

    cells.push(
      <Pressable
        key={i}
        style={[styles.wrapper, isActive && styles.wrapperActive]}
        className="wordle-cell-pressable"
        onPress={() => {
          if (onCellClick) {
            onCellClick(i)
          }
        }}
      >
        <View
          style={styles.dotsRow}
          {...(i === 0 ? { nativeID: 'tour-feedback-dots' } : {})}
        >
          {/* 3 chấm trống khi chưa có feedback */}
          {[0, 1, 2].map((idx) => (
            <View
              key={idx}
              style={[styles.dot, styles.dotInactive]}
            />
          ))}
        </View>
        <View 
          style={[styles.cell, isActive && styles.cellActive]}
          onStartShouldSetResponder={() => true}
          onResponderReject={() => {}}
        >
          <Text 
            style={styles.text}
            selectable={false}
          >
            {displayText}
          </Text>
        </View>
      </Pressable>
    )
  }

  return (
    <>
      {Platform.OS === 'web' && (
        <style dangerouslySetInnerHTML={{ __html: INPUT_ROW_CSS }} />
      )}
      <View style={styles.row}>
        {cells}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  wrapperActive: {
    opacity: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotInactive: {
    backgroundColor: '#B0BEC5',
  },
  cell: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#d3d6da',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    ...(Platform.OS === 'web' && { cursor: 'text' }),
  },
  cellActive: {
    borderColor: '#6AAA64',
    borderWidth: 3,
    backgroundColor: '#f0f8f0',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1b',
    textAlign: 'center',
  },
})

