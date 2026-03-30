import React from 'react'
import { StyleSheet, View } from 'react-native'

import SolitareResult from '../../components/solitare/solitare-result/solitare-result'

export function SolitareResultScreen({ score = 0, timeLeft = 0, level = 'medium', onReplay }) {
  return (
    <View style={styles.container}>
      <SolitareResult score={score} timeLeft={timeLeft} level={level} onReplay={onReplay} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EEDC',
  },
})

export default SolitareResultScreen

