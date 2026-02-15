import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { SolitareRuleHeader } from './solitare-rule-header'
import { SolitareRuleBody } from './solitare-rule-body'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Layout trang luật chơi solitaire (native)
 */
export function SolitareRuleLayoutNative({ onStart }) {
  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <SolitareRuleHeader />
        <SolitareRuleBody onStart={onStart} />
      </View>

      <Image source={normalizeImageSource(CarrotGround)} style={styles.ground} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F7F0DD',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  inner: {
    width: '100%',
    alignItems: 'stretch',
    flexShrink: 0,
  },
  ground: {
    width: '100%',
    height: 160,
  },
})

export default SolitareRuleLayoutNative


