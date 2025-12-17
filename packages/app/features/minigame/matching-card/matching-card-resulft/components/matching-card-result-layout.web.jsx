import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { MatchingCardHeader } from '../../matching-card-play/components/matching-card-header'
import MatchingCardResultContent from './matching-card-result-content'

/**
 * Web layout cho màn kết quả Matching Card
 *
 * @param {{
 *  topicId?: string
 *  topicName?: string
 *  score?: number
 *  topPercent?: number
 *  timeLeft?: number
 *  onReplay?: () => void
 *  onBack?: () => void
 * }} props
 */
export function MatchingCardResultLayout({
  topicId = 'life',
  topicName,
  score = 0,
  topPercent = 5,
  timeLeft = 0,
  onReplay,
  onBack,
}) {
  return (
    <View style={styles.page}>
      <View style={styles.headerWrapper}>
        <MatchingCardHeader
          topicId={topicId}
          topicName={topicName}
          score={score}
          initialSeconds={timeLeft}
          staticMode
          showControls={false}
        />
      </View>

      <View style={styles.contentWrapper}>
        <MatchingCardResultContent score={score} topPercent={topPercent} timeLeft={timeLeft} onReplay={onReplay} />
      </View>

      <Image
        source={normalizeImageSource(CarrotGround)}
        style={styles.carrotGround}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3EEDC',
  },
  headerWrapper: {
    width: '30%',
    paddingTop: 16,
    paddingHorizontal: 32,
    left: 535,
  },
  contentWrapper: {
    flex: 0.9,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrotGround: {
    width: '100%',
    height: 190,
  },
})

export default MatchingCardResultLayout
