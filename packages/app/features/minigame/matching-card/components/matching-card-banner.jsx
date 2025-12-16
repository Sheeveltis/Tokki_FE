import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { MinigameCard } from '../../components/minigame-card'
import MatchingLogo from '../../../../../assets/icon/icon-mainflow/matching-logo.png'
import MatchingBanner from '../../../../../assets/matching-banner.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MatchingCardBanner() {
  const header = (
    <View style={styles.headerContent}>
      <View style={styles.logoBox}>
        <Image source={normalizeImageSource(MatchingLogo)} style={styles.logo} resizeMode="contain" />
      </View>
      <Text style={styles.title}>Lật thẻ bài từ vựng</Text>
    </View>
  )

  return (
    <MinigameCard header={header}>
      <View style={styles.bannerWrapper}>
        <Image source={normalizeImageSource(MatchingBanner)} style={styles.banner} resizeMode="contain" />
      </View>
    </MinigameCard>
  )
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 26,
    height: 26,
  },
  title: {
    fontSize: 24,
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
    width: '100%',
    height: 220,
  },
})


