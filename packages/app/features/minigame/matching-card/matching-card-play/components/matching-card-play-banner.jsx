import React from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import MatchingLogo from '../../../../../../assets/icon/icon-mainflow/matching-logo.png'
import MatchingBanner from '../../../../../../assets/matching-banner.png'
import BackgroundImage from '../../../../../../assets/background3.png'
import CarrotImage from '../../../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MatchingCardBanner({ onStart }) {
  const header = (
    <View style={styles.headerContent}>
      <View style={styles.logoBox}>
        <Image source={normalizeImageSource(MatchingLogo)} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Lật thẻ bài từ vựng</Text>
    </View>
  )

  const handleStart = () => {
    if (typeof onStart === 'function') onStart()
  }

  return (
    <Pressable onPress={handleStart} style={styles.wrapper}>
      <Image source={normalizeImageSource(BackgroundImage)} style={styles.background} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerBox}>{header}</View>

        <View style={styles.body}>
          <View style={styles.bannerWrapper}>
            <Image
              source={normalizeImageSource(MatchingBanner)}
              style={styles.banner}
              resizeMode="contain"
            />
          </View>
        </View>

        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotTopRight]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotMidLeft]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotBottomRight]} />
      </View>

    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 32,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 24,
  },
  headerBox: {
    backgroundColor: '#F4EDE7',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  body: {
    marginTop: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  bannerWrapper: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  banner: {
    width: '50vh',
    height: 220,
    bottom: 10,
  },
  carrot: {
    position: 'absolute',
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  carrotTopRight: {
    top: -10,
    right: 20,
  },
  carrotMidLeft: {
    top: 140,
    left: 40,
  },
  carrotBottomRight: {
    bottom: -8,
    right: 80,
  },
  startButton: {},
  startButtonText: {},
})


