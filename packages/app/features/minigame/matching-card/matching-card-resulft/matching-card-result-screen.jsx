import React from 'react'
import { View, StyleSheet } from 'react-native'
import MatchingCardResultLayout from './components/matching-card-result-layout.web'

export function MatchingCardResultScreen({
  topicId = 'life',
  topicName,
  score = 0,
  topPercent = 5,
  timeLeft = 0,
  onBack,
}) {
  const handleReplay = () => {
    if (typeof onBack === 'function') onBack()
  }

  return (
    <View style={styles.container}>
      <MatchingCardResultLayout
        topicId={topicId}
        topicName={topicName}
        score={score}
        topPercent={topPercent}
        timeLeft={timeLeft}
        onReplay={handleReplay}
        onBack={onBack}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3EEDC',
  },
})

export default MatchingCardResultScreen
