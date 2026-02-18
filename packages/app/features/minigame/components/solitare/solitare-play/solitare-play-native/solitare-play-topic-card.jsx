import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import DecorLeaf from '../../../../../../../assets/icon/decor/18.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Cột topic card cho màn chơi Solitaire
 * - Nền trắng #FFFFFF với opacity ~36% (cho ô topic)
 * - Phía trên có icon lá `18.png`
 * - Dùng làm khung chứa thẻ con sau này (children)
 */
export function SolitarePlayTopicCard({ style, children, useOpacity = true }) {
  return (
    <View style={[styles.wrapper, style]}>
      <Image
        source={normalizeImageSource(DecorLeaf)}
        style={styles.decor}
        resizeMode="contain"
      />

      <View style={[styles.card, !useOpacity && styles.cardSolid]}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  decor: {
    width: 40,
    height: 24,
    marginBottom: -8,
    zIndex: 2,
  },
  card: {
    width: 80,
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: 'rgba(255, 255, 255, 0.36)', // #FFFFFF với opacity 36% cho ô topic
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSolid: {
    backgroundColor: '#FFFFFF',
  },
})

export default SolitarePlayTopicCard


