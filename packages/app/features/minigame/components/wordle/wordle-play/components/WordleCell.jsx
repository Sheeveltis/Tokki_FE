import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'

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
          const status = dot.status
          const isGreen = status === 'green'
          const isYellow = status === 'yellow'
          return (
            <View
              key={dot.key}
              style={[
                styles.dot,
                isGreen ? styles.dotGreen : isYellow ? styles.dotYellow : styles.dotInactive,
              ]}
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
  dotGreen: {
    backgroundColor: '#4CAF50',
  },
  dotYellow: {
    backgroundColor: '#FDD835',
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  cell: {
    width: 52,
    height: 52,
    borderWidth: 3,
    borderColor: '#8D6E63', // Wooden frame color
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF9C4', // Soft clay color
    ...(Platform.OS === 'web' && {
      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.15)',
    }),
  },
  cellGreen: {
    backgroundColor: '#81C784',
    borderColor: '#388E3C',
  },
  cellYellow: {
    backgroundColor: '#FFF176',
    borderColor: '#FBC02D',
  },
  cellGray: {
    backgroundColor: '#CFD8DC',
    borderColor: '#90A4AE',
  },
  text: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4E342E',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  whiteText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
})

