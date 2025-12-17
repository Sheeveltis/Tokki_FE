import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MatchingCardLayout } from './components/matching-card-layout.web'

export function MatchingCardScreen({ topicId = 'life', topicName, levelId = 'medium', onBack }) {
  return (
    <View style={styles.container}>
      <MatchingCardLayout topicId={topicId} topicName={topicName} levelId={levelId} onBack={onBack} />
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
