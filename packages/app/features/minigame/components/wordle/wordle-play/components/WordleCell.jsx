import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * WordleCell dùng feedback từ API:
 * {
 *   character: '불',
 *   blockColor: 'Green' | 'Yellow' | 'Gray',
 *   initialStatus: 'Green' | 'Gray',
 *   vowelStatus: 'Green' | 'Gray',
 *   finalStatus: 'Green' | 'Gray',
 * }
 */
export function WordleCell({ feedback }) {
  const letter = feedback?.character || ''
  const initialStatus = (feedback?.initialStatus || '').toLowerCase()
  const vowelStatus = (feedback?.vowelStatus || '').toLowerCase()
  const finalStatus = (feedback?.finalStatus || '').toLowerCase()
  const blockColor = (feedback?.blockColor || '').toLowerCase()

  // Màu block theo blockColor (ưu tiên chuẩn backend)
  let cellStyle = styles.cell
  let textStyle = styles.text
  if (blockColor === 'green') {
    cellStyle = [styles.cell, styles.cellGreen]
    textStyle = [styles.text, styles.whiteText]
  } else if (blockColor === 'yellow') {
    cellStyle = [styles.cell, styles.cellYellow]
    textStyle = [styles.text, styles.whiteText]
  } else if (blockColor === 'gray') {
    cellStyle = [styles.cell, styles.cellGray]
    textStyle = [styles.text, styles.whiteText]
  }

  // Hiển thị 3 chấm: initialStatus, vowelStatus, finalStatus
  // Chấm xanh nếu status === 'green', xám nếu === 'gray'
  const dots = [
    { status: initialStatus, key: 'initial' },
    { status: vowelStatus, key: 'vowel' },
    { status: finalStatus, key: 'final' },
  ]

  return (
    <View style={styles.wrapper}>
      <View style={styles.dotsRow}>
        {dots.map((dot) => {
          const isGreen = dot.status === 'green'
          return (
            <View
              key={dot.key}
              style={[styles.dot, isGreen ? styles.dotActive : styles.dotInactive]}
            />
          )
        })}
      </View>
      <View style={cellStyle}>
        <Text style={textStyle}>{letter}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  dotInactive: {
    backgroundColor: '#B0BEC5',
  },
  cell: {
    width: 52,
    height: 52,
    borderWidth: 2,
    borderColor: '#d3d6da',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  cellGreen: {
    backgroundColor: '#6AAA64',
    borderColor: '#6AAA64',
  },
  cellYellow: {
    backgroundColor: '#C9B458',
    borderColor: '#C9B458',
  },
  cellGray: {
    backgroundColor: '#787C7E',
    borderColor: '#787C7E',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1b',
  },
  whiteText: {
    color: '#fff',
  },
})

