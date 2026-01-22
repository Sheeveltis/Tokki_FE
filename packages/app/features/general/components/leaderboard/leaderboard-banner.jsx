'use client'

import React from 'react'
import { StyleSheet, Text, View, Image, Platform } from 'react-native'

// Import carrot image
import CarrotImage from '../../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string' && src !== 'null' && src !== '') return { uri: src }
  return src
}

/**
 * Banner component hiển thị tiêu đề "Bảng xếp hạng" với carrot decoration
 */
export function LeaderboardBanner() {
  const carrotSource = normalizeImageSource(CarrotImage)
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bảng xếp hạng</Text>
      {carrotSource && (
        <Image
          source={carrotSource}
          style={styles.carrotImage}
          resizeMode="contain"
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AC6B41',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    flex: 1,
    maxWidth: 600,
    overflow: 'visible',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    zIndex: 1,
  },
  carrotImage: {
    position: 'absolute',
    top: -40,
    right: -80,
    width: 150,
    height: 80,
    zIndex: 10,
  },
})

