import React from 'react'
import { View, StyleSheet } from 'react-native'
import MatchingCardResultLayout from './components/matching-card-result-layout.web'

export function MatchingCardResultScreen({
  gameId = '',
  topicId = 'life',
  topicName,
  levelId = 'medium',
  score = 0,
  topPercent = 5,
  timeLeft = 0,
  hasPlayed = false,
  onBack,
}) {
  const handleReplay = () => {
    if (typeof onBack === 'function') onBack()
  }

  return (
    <View style={styles.container}>
      <MatchingCardResultLayout
        gameId={gameId}
        topicId={topicId}
        topicName={topicName}
        levelId={levelId}
        score={score}
        topPercent={topPercent}
        timeLeft={timeLeft}
        hasPlayed={hasPlayed}
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
