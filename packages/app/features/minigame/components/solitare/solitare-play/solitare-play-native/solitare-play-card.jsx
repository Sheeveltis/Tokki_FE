import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, StyleSheet, Text, Image } from 'react-native'

import BunnyImage from '../../../../../../../assets/bunny/14.png'
import { SolitarePlayTopicCard } from './solitare-play-topic-card'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Một lá bài trong game Solitaire.
 * - Mặt trước: hình bunny (hoặc image khác trong tương lai)
 * - Mặt sau: text từ vựng (mock)
 *
 * @param {{
 *  isFront?: boolean
 *  text?: string
 *  onPress?: () => void
 *  isSelected?: boolean
 * }} props
 */
export function SolitarePlayCard({ isFront = true, text = '습관', onPress, isSelected = false }) {
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.timing(scale, {
      toValue: isSelected ? 1.06 : 1,
      duration: 120,
      useNativeDriver: true,
    }).start()
  }, [isSelected, scale])

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Animated.View
        style={[
          styles.animatedWrap,
          { transform: [{ scale }] },
          isSelected && styles.selectedShadow,
        ]}
      >
        <SolitarePlayTopicCard useOpacity={false}>
          {isFront ? (
            <Image
              source={normalizeImageSource(BunnyImage)}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.text}>{text}</Text>
          )}
        </SolitarePlayTopicCard>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 4,
  },
  animatedWrap: {
    shadowColor: '#00000055',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedShadow: {
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  image: {
    width: 56,
    height: 72,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
})

export default SolitarePlayCard


