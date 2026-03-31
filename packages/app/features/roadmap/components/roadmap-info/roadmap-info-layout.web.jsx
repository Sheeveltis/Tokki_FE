import React from 'react'
import { Image, StyleSheet, View, ScrollView } from 'react-native'

import { Navbar } from '../../../../../components/navbar'
import BunnyImage from '../../../../../assets/bunny/1.png'
import { RoadmapInfo } from './roadmap-info'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function RoadmapInfoLayout({ onStart, initialLevel }) {
  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentRow}>
        <View style={styles.bunnySection}>
          <View style={styles.bunnyBackgroundCircle} />
          <Image source={normalizeImageSource(BunnyImage)} style={styles.bunnyImage} resizeMode="contain" />
        </View>

        <View style={styles.infoSection}>
          <RoadmapInfo onStart={onStart} initialLevel={initialLevel} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAF9F6', // More sophisticated off-white
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
    minHeight: '100vh',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
    maxWidth: 1400,
    width: '100%',
    // paddingVertical: 60,
    // paddingHorizontal: 20,
  },
  bunnySection: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 400,
  },
  bunnyBackgroundCircle: {
    position: 'absolute',
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: 'rgba(255, 230, 200, 0.4)',
    bottom: -40,
  },
  bunnyImage: {
    width: '100%',
    height: 540,
    zIndex: 1,
  },
  infoSection: {
    flex: 1,
    minWidth: 600,
    maxWidth: 800,
  },
  groundContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  groundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
})
