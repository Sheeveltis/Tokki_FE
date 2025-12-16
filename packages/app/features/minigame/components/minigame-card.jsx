import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

import BackgroundImage from '../../../../assets/background3.png'
import CarrotImage from '../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

// Generic minigame card container with background + rounded header box.
// Header content & body content được truyền từ component cha.
export function MinigameCard({ header, children }) {
  return (
    <View style={styles.wrapper}>
      {/* Background pattern */}
      <Image source={normalizeImageSource(BackgroundImage)} style={styles.background} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerBox}>{header}</View>
        <View style={styles.body}>{children}</View>

        {/* Carrots decorations (always in card container) */}
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotTopRight]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotMidLeft]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotBottomRight]} />
      </View>
    </View>
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
})

