import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * Row hiển thị currentGuess đang được nhập
 * Cho phép click vào từng cell để focus và nhập
 * currentGuess: chuỗi ký tự Hangul đã ghép
 * jamoSequences: mảng các sequence jamo cho mỗi ô
 */
export function WordleInputRow({ currentGuess = '', jamoSequences = [], length = 5, onCellClick }) {
  const cells = []
  
  // Tìm ô đang nhập: ô cuối cùng có jamo nhưng chưa đủ 3, hoặc ô tiếp theo nếu tất cả đã đủ 3
  let activeIndex = 0
  for (let i = 0; i < jamoSequences.length; i++) {
    const seq = jamoSequences[i] || []
    if (seq.length < 3) {
      activeIndex = i
      break
    }
    // Nếu tất cả các ô đã đủ 3 jamo, activeIndex sẽ là ô tiếp theo
    if (i === jamoSequences.length - 1 && seq.length >= 3) {
      activeIndex = jamoSequences.length
    }
  }
  // Nếu chưa có ô nào, activeIndex = 0
  if (jamoSequences.length === 0) {
    activeIndex = 0
  }

  for (let i = 0; i < length; i++) {
    // Hiển thị ký tự Hangul đã ghép từ currentGuess, nếu chưa có thì hiển thị jamo riêng lẻ
    const hangulChar = currentGuess[i] || ''
    const jamoSequence = jamoSequences[i] || []
    // Nếu đã có ký tự Hangul thì hiển thị nó, nếu chưa thì hiển thị jamo riêng lẻ
    const displayText = hangulChar || (jamoSequence.length > 0 ? jamoSequence.join(' ') : '')
    const isActive = i === activeIndex // Ô đang được focus

    cells.push(
      <Pressable
        key={i}
        style={[styles.wrapper, isActive && styles.wrapperActive]}
        onPress={() => {
          if (onCellClick) {
            onCellClick(i)
          }
        }}
      >
        <View style={styles.dotsRow}>
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

