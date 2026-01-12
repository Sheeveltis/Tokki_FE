import React, { useRef } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { MatchingCardRuleHeader } from '../../matching-card-rule/components/matching-card-rule-header'
import { MatchingCardTopic } from './matching-card-topic'
import { MatchingCardTopicButton } from './matching-card-topic-btn'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Layout trang chọn chủ đề matching card
 */
export function MatchingCardTopicLayoutWeb({ levelId, selectedId, onSelect, onConfirm }) {
  const topicConfirmRef = useRef(null)

  const handleButtonPress = () => {
    console.log('[MatchingCardTopicLayoutWeb] Button pressed, ref:', topicConfirmRef.current)
    if (topicConfirmRef.current && typeof topicConfirmRef.current.confirm === 'function') {
      topicConfirmRef.current.confirm()
    } else {
      console.warn('[MatchingCardTopicLayoutWeb] Ref or confirm method not available')
    }
  }

  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <MatchingCardRuleHeader />
        <View style={styles.bodyWrapper}>
          <MatchingCardTopic 
            ref={topicConfirmRef}
            levelId={levelId} 
            selectedId={selectedId} 
            onSelect={onSelect} 
            onConfirm={onConfirm}
          />
          <View style={styles.buttonWrapper}>
            <MatchingCardTopicButton onPress={handleButtonPress} />
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
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: 1024,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  bodyWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    marginTop: 12,
    overflow: 'hidden',
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: 'center',
  },
  ground: {
    width: '100%',
    height: 180,
    marginTop: 'auto',
    flexShrink: 0,
  },
})

export default MatchingCardTopicLayoutWeb


