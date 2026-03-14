import React, { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform, Animated } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import BunnyFront from '../../../../../../assets/bunny/1.png'
import CarrotImage from '../../../../../../assets/carrot.png'

export function MatchingCard({
  frontImage = BunnyFront,
  style,
  word,
  face = 'ko',
  flipped: flippedProp,
  matched = false,
  onFlip,
  imgUrl = null,
}) {
  const [current, setCurrent] = useState(word || null)
  const [fade] = useState(new Animated.Value(1))
  const [flipAnim] = useState(new Animated.Value(0))

  const flipped = typeof flippedProp === 'boolean' ? flippedProp : false

  useEffect(() => {
    if (word) setCurrent(word)
  }, [word])

  useEffect(() => {
    if (matched) {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start()
    } else {
      fade.setValue(1)
    }
  }, [matched, fade])

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: flipped ? 180 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 12,
    }).start()
  }, [flipped, flipAnim])

  const handlePress = () => {
    if (matched) return
    if (typeof onFlip === 'function') onFlip()
  }

  const backLabelKo = current?.ko || '...'
  const backLabelVi = current?.vi || ''
  const backLabel = face === 'vi' ? backLabelVi : backLabelKo

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  })

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  })

  const animatedScale = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  })

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fade,
          transform: [{ scale: animatedScale }],
        },
      ]}
      pointerEvents={matched ? 'none' : 'auto'}
    >
      <Pressable
        onPress={handlePress}
        disabled={matched}
        style={({ pressed }) => [
          styles.card,
          pressed && !matched && styles.cardPressed,
          style,
        ]}
      >
        <View style={styles.inner}>
          <View style={styles.flipWrapper}>
            <Animated.View
              style={[
                styles.face,
                styles.front,
                {
                  transform: [{ perspective: 800 }, { rotateY: frontRotate }],
                },
              ]}
            >
              <Image
                source={normalizeImageSource(frontImage)}
                style={styles.avatar}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.face,
                styles.back,
                {
                  transform: [{ perspective: 800 }, { rotateY: backRotate }],
                },
              ]}
            >
              {face === 'vi' && imgUrl ? (
                <View style={styles.backContent}>
                  <Image
                    source={normalizeImageSource({ uri: imgUrl })}
                    style={styles.backImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.word} numberOfLines={3} adjustsFontSizeToFit>
                    {backLabel}
                  </Text>
                </View>
              ) : (
                <Text style={styles.word} numberOfLines={3} adjustsFontSizeToFit>
                  {backLabel}
                </Text>
              )}
            </Animated.View>
          </View>
        </View>

        <Image
          source={normalizeImageSource(CarrotImage)}
          style={styles.carrot}
          resizeMode="contain"
        />
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: 130,
    height: 150,
    margin: 6,
    overflow: 'visible',
  },
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFF9EB',
    borderWidth: 1,
    borderColor: '#E3D9B5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'visible',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  inner: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  flipWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.08,
  },
  front: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
  },
  back: {
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingRight: 12,
  },
  backContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  backImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  word: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
  },
  meaning: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  carrot: {
    position: 'absolute',
    width: 70,
    height: 70,
    top: -35,
    right: -35,
    zIndex: 10,
  },
})