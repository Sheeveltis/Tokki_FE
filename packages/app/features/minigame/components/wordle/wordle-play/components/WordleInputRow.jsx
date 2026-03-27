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
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  cell: {
    width: 52,
    height: 52,
    borderWidth: 3,
    borderColor: '#8D6E63',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 4,
    ...(Platform.OS === 'web' && { 
      cursor: 'text',
      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.15)',
    }),
  },
  cellActive: {
    borderColor: '#4CAF50',
    borderWidth: 3,
    backgroundColor: '#E8F5E9',
    ...(Platform.OS === 'web' && { 
      boxShadow: 'inset 0 -4px 0 rgba(76, 175, 80, 0.2), 0 4px 6px rgba(0,0,0,0.2)',
    }),
  },
  text: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4E342E',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
})

