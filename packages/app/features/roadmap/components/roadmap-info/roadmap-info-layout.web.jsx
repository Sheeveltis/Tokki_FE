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
    <View style={styles.wrapper}>
      <View style={styles.contentRow}>
        <View style={styles.bunnySection}>
          <View style={styles.bunnyBackgroundCircle} />
          <Image source={normalizeImageSource(BunnyImage)} style={styles.bunnyImage} resizeMode="contain" />
        </View>

        <View style={styles.infoSection}>
          <RoadmapInfo onStart={onStart} initialLevel={initialLevel} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAF9F6', // More sophisticated off-white
    minHeight: '100vh',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingTop: 40,
    // paddingBottom: 140, // Space for ground
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
    maxWidth: 1200,
    width: '90%',
    paddingVertical: 40,
  },
  bunnySection: {
    flex: 0.8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 320,
  },
  bunnyBackgroundCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 230, 200, 0.4)',
    bottom: -20,
  },
  bunnyImage: {
    width: '100%',
    height: 480,
    zIndex: 1,
  },
  infoSection: {
    flex: 1.2,
    minWidth: 500,
    maxWidth: 720,
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
