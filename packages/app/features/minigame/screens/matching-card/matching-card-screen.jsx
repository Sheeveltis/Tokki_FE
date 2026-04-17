import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MatchingCardLayout } from '../../components/matching-card/matching-card-play/matching-card-play-layout'

export function MatchingCardScreen({ topicId, topicName, levelId = 'medium', quantity, onBack }) {
  return (
    <View style={styles.container}>
      <MatchingCardLayout topicId={topicId} topicName={topicName} levelId={levelId} quantity={quantity} onBack={onBack} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EEDC',
  },
})

export default MatchingCardScreen
