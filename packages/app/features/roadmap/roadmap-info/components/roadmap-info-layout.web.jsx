import React from 'react'
import { Image, ImageBackground, StyleSheet, View } from 'react-native'

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
        {/* Main Content Row */}
        <View style={styles.contentRow}>
          {/* Left: Bunny Character */}
          <View style={styles.bunnyContainer}>
            <Image
              source={normalizeImageSource(BunnyImage)}
              style={styles.bunnyImage}
              resizeMode="contain"
            />
          </View>

          {/* Right: Roadmap Info Component */}
          <View style={styles.infoContainer}>
            <RoadmapInfo onStart={onStart} initialLevel={initialLevel} />
          </View>
        </View>
      </View>

      {/* Bottom: Carrot Ground - Outside container */}
      <View style={styles.groundContainer}>
        <Image
          source={normalizeImageSource(CarrotGround)}
          style={styles.groundImage}
          resizeMode="cover"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    minHeight: '90vh',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    position: 'relative',
    minHeight: 0,
    paddingTop:73,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 80,
    paddingBottom: 20,
    gap: 60,
    top: 30,
    position: 'relative',
  },
  bunnyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: 500,
  },
  bunnyImage: {
    width: '100%',
    height: 400,
    maxWidth: 400,
  },
  infoContainer: {
    flex: 1,
    maxWidth: 600,
    left: 30,
    paddingBottom: 20,
  },
  groundContainer: {
    width: '100%',
    backgroundColor: '#F5F0DD',
    minHeight: 200,
    flexShrink: 0,
  },
  groundImage: {
    width: '100%',
    height: 200,
    opacity: 1,
    zIndex: 1,
  },
})

