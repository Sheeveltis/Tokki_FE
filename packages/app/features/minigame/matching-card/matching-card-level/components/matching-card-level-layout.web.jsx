import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { MatchingCardRuleHeader } from '../../matching-card-rule/components/matching-card-rule-header'
import { MatchingCardLevel } from './matching-card-level'
import { MatchingCardTopicButton } from '../../matching-card-topic/components/matching-card-topic-btn'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Layout trang chọn mức độ matching card
 */
export function MatchingCardLevelLayoutWeb({ topicId, topicName, levelId, selectedId, onSelect, onConfirm }) {
  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <MatchingCardRuleHeader />
        <View style={styles.bodyWrapper}>
          <MatchingCardLevel levelId={levelId} selectedId={selectedId} onSelect={onSelect} onConfirm={onConfirm} />
          <View style={styles.buttonWrapper}>
            <MatchingCardTopicButton onPress={onConfirm} />
          </View>
        </View>
      </View>

      <Image source={normalizeImageSource(CarrotGround)} style={styles.ground} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    height: '100vh',
    backgroundColor: '#F7F0DD',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 0,
  },
  inner: {
    width: '100%',
    maxWidth: 1024,
    alignItems: 'stretch',
    flexShrink: 0,
  },
  bodyWrapper: {
    paddingHorizontal: 32,
    marginTop: 40,
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  ground: {
    width: '100%',
    height: 180,
    marginTop: 'auto',
  },
})

export default MatchingCardLevelLayoutWeb

