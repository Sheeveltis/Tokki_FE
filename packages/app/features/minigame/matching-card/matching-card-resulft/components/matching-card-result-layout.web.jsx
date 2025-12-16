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
 *  onReplay?: () => void
 *  onBack?: () => void
 * }} props
 */
export function MatchingCardResultLayout({
  topicId = 'life',
  topicName,
  score = 0,
  topPercent = 5,
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
          initialSeconds={0}
          onTimeUp={() => {}}
        />
      </View>

      <View style={styles.contentWrapper}>
        <MatchingCardResultContent score={score} topPercent={topPercent} onReplay={onReplay} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerWrapper: {
    width: '100%',
    paddingTop: 16,
    paddingHorizontal: 32,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrotGround: {
    width: '100%',
    height: 140,
  },
})

export default MatchingCardResultLayout
