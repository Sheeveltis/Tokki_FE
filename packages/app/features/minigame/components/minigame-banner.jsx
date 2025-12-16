import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

import BackgroundImage from '../../../../assets/background1.png'
import BunnyIcon from '../../../../assets/bunny/1.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

// MinigameBanner: banner chào mừng minigame với bunny bên trái + nền carrot
export function MinigameBanner() {
  return (
    <View style={styles.wrapper}>
      {/* Background pattern */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={styles.background}
        resizeMode="cover"
      />

      {/* Nội dung */}
      <View style={styles.content}>
        <View style={styles.bunnyContainer}>
          <Image
            source={normalizeImageSource(BunnyIcon)}
            style={styles.bunny}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.text}>Chào mừng đến với MiniGame của chúng tôi</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    minHeight: 80,
    backgroundColor: '#F89D2B', // fallback màu cam nếu background không load
    shadowColor: '#00000025',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  bunnyContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEBD0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  bunny: {
    width: 52,
    height: 52,
  },
  text: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})


