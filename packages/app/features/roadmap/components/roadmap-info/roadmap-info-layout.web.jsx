import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { Navbar } from '../../../../../components/navbar'
import BunnyImage from '../../../../../assets/bunny/1.png'
import CarrotGround from '../../../../../assets/carrot-ground.png'
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
      <Navbar />

      <View style={styles.container}>
        <View style={styles.contentRow}>
          <View style={styles.bunnyContainer}>
            <Image source={normalizeImageSource(BunnyImage)} style={styles.bunnyImage} resizeMode="contain" />
          </View>

          <View style={styles.infoContainer}>
            <RoadmapInfo onStart={onStart} initialLevel={initialLevel} />
          </View>
        </View>
      </View>

      <View style={styles.groundContainer}>
        <Image source={normalizeImageSource(CarrotGround)} style={styles.groundImage} resizeMode="cover" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    minHeight: 0,
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  contentRow: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 28,
    maxWidth: 1320,
    width: '100%',
    alignSelf: 'center',
  },
  bunnyContainer: {
    flex: 0.95,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 280,
    maxWidth: 460,
  },
  bunnyImage: {
    width: '100%',
    height: '85%',
    maxHeight: 420,
  },
  infoContainer: {
    flex: 1.25,
    minWidth: 520,
    maxWidth: 760,
    justifyContent: 'center',
    paddingBottom: 10,
  },
  groundContainer: {
    width: '100%',
    backgroundColor: '#F5F0DD',
    height: 120,
    flexShrink: 0,
  },
  groundImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
})
