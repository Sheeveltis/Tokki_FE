import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { MatchingCardRuleHeader } from './matching-card-rule-header'
import { MatchingCardRuleBody } from './matching-card-rule-body'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Layout trang luật chơi matching card (web)
 * - Header trên cùng
 * - Nội dung luật ở giữa
 * - Dải carrot ground ở dưới
 */
export function MatchingCardRuleLayoutWeb({ onSelectTopic }) {
  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <MatchingCardRuleHeader />
        <MatchingCardRuleBody onSelectTopic={onSelectTopic} />
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
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  inner: {
    width: '100%',
    maxWidth: 1024,
    alignItems: 'stretch',
    flexShrink: 0,
  },
  ground: {
    width: '100%',
    height: 190,
  },
})

export default MatchingCardRuleLayoutWeb

