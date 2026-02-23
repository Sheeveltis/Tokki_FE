import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Hiển thị hàng từ cần đoán (target word)
 * - Khi chưa đoán đúng: hiển thị 2 ô lớn có dấu "?"
 * - Khi đã đoán đúng: hiển thị từ đã đoán đúng
 */
export function WordleTargetRow({ wordLength = 2, targetWord = '' }) {
  const cells = []

  for (let i = 0; i < wordLength; i++) {
    const letter = targetWord?.[i] || ''
    const isRevealed = !!targetWord && targetWord.length > 0

    cells.push(
      <View key={i} style={styles.wrapper}>
        <View style={[styles.cell, isRevealed && styles.cellRevealed]}>
          <Text style={[styles.text, isRevealed && styles.textRevealed]}>
            {isRevealed ? letter : '?'}
          </Text>
        </View>
      </View>
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
    marginBottom: 15,
  },
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 3,
  },
  cell: {
    width: 70,
    height: 70,
    borderWidth: 2,
    borderColor: '#d3d6da',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  cellRevealed: {
    backgroundColor: '#6AAA64',
    borderColor: '#6AAA64',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1b',
  },
  textRevealed: {
    color: '#fff',
  },
})

