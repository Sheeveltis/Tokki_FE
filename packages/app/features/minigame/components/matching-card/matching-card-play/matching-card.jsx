import React, { useEffect, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform, Animated } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import FrontCard from '../../../../../../assets/FrontCard.png'
import BackCard from '../../../../../../assets/BackCard.png'

export function MatchingCard({
  frontImage = FrontCard,
  style,
  word,
  face = 'ko',
  flipped: flippedProp,
  matched = false,
  onFlip,
  imgUrl = null,
  size = 'medium',
}) {
  const [current, setCurrent] = useState(word || null)
  const [fade] = useState(new Animated.Value(1))
  const [flipAnim] = useState(new Animated.Value(0))

  const flipped = typeof flippedProp === 'boolean' ? flippedProp : false

  const avatarStyle =
    size === 'large'
      ? styles.avatarLarge
      : size === 'small'
        ? styles.avatarSmall
        : styles.avatar

  const wordStyle =
    size === 'large'
      ? styles.wordLarge
      : size === 'small'
        ? styles.wordSmall
        : styles.word

  const backImageStyle =
    size === 'large'
      ? styles.backImageLarge
      : size === 'small'
        ? styles.backImageSmall
        : styles.backImage
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
        style,
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
                style={styles.frontBackground}
                resizeMode="cover"
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
              <Image
                source={normalizeImageSource(BackCard)}
                style={styles.backBackground}
                resizeMode="cover"
              />
              {face === 'vi' && imgUrl ? (
                <View style={styles.backContent}>
                  <Image
                    source={normalizeImageSource({ uri: imgUrl })}
                    style={backImageStyle}
                    resizeMode="cover"
                  />
                  <Text style={wordStyle} numberOfLines={3} adjustsFontSizeToFit>
                    {backLabel}
                  </Text>
                </View>
              ) : (
                <Text style={wordStyle} numberOfLines={3} adjustsFontSizeToFit>
                  {backLabel}
                </Text>
              )}
            </Animated.View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: 130,
    height: 140,
    margin: 6,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  inner: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
    overflow: 'hidden',
    borderRadius: 18,
  },
  frontBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
  },
  backBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
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
  meaning: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  backImageLarge: {
    width: 95,
    height: 95,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  backImageSmall: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },

  word: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  wordLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  wordSmall: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
})