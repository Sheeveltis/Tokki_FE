import React, { useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { useRouter } from 'solito/navigation'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import { SolitarePlayHeader } from './solitare-play-header'
import { SolitarePlayBody } from './solitare-play-body'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Layout màn chơi Solitaire (native)
 */
export function SolitarePlayLayoutNative() {
  const router = useRouter()
  const [score, setScore] = useState(0)

  const handleTimeUp = () => {
    // TODO: xử lý khi hết giờ (native)
  }

  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <SolitarePlayHeader score={score} onTimeUp={handleTimeUp} onTick={() => {}} />
        </View>

        <View style={styles.bodyWrapper}>
          <SolitarePlayBody />
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
    backgroundColor: '#F7F0DD',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  inner: {
    width: '100%',
    alignItems: 'stretch',
    flexShrink: 0,
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  bodyWrapper: {
    flex: 1,
  },
  ground: {
    width: '100%',
    height: 150,
  },
})

export default SolitarePlayLayoutNative


