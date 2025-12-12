import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../api'

import BunnyWithCarrot from '../../../../../assets/bunny/14.png'
import BackgroundPattern from '../../../../../assets/background1.png'

/**
 * TopikBanner: Banner hiển thị lộ trình học TOPIK
 */
export function TopikBanner({ levelId, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        pressed && styles.bannerPressed,
      ]}
      onPress={onPress}
    >
      {/* Layers: color + pattern */}
      <View style={styles.colorLayer} />
      <Image
        source={normalizeImageSource(BackgroundPattern)}
        style={styles.patternLayer}
        resizeMode="repeat"
      />

      <View style={styles.content}>
        {/* Thỏ bên trái */}
        <View style={styles.leftSection}>
          <Image
            source={normalizeImageSource(BunnyWithCarrot)}
            style={styles.bunny}
            resizeMode="contain"
          />
        </View>

        {/* Text ở giữa */}
        <View style={styles.centerSection}>
          <Text style={styles.bannerText}>LỘ TRÌNH HỌC TOPIK - LEVEL {levelId}</Text>
        </View>

        {/* Arrow bên phải */}
        <View style={styles.rightSection}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#FF6B1A',
    shadowColor: '#00000020',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, shadowOpacity',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  bannerPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  colorLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F4900C',
    zIndex: 0,
  },
  patternLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    justifyContent: 'flex-start',
  },
  bunny: {
    width: 80,
    height: 80,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  rightSection: {
    width: 120,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})


