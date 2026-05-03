import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'

import BackgroundImage from '../../../../../assets/background1.png'
import BunnyIcon from '../../../../../assets/bunny/1.png'

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
      {/* Background Decor: Stripes */}
      <View style={styles.stripesContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.stripe, { right: 80 + i * 25 }]} />
        ))}
      </View>

      <View style={styles.content}>
        {/* Bunny Icon Box */}
        <View style={styles.bunnyContainer}>
          <View style={styles.bunnyInner}>
            <Image
              source={normalizeImageSource(BunnyIcon)}
              style={styles.bunny}
              resizeMode="contain"
            />
          </View>
          {/* Sparkle icon could be added here if available, using a simple view for now */}
          <View style={styles.sparkle} />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <View style={styles.welcomeRow}>
            <View style={styles.orangeBar} />
            <Text style={styles.welcomeText}>WELCOME BACK</Text>
          </View>

          <Text style={styles.title}>
            Chào mừng đến với <Text style={styles.highlightText}>Minigame</Text> của chúng tôi!
          </Text>

          <Text style={styles.subtitle}>
            Khám phá kho kiến thức đầy màu sắc ngay bây giờ...
          </Text>
        </View>

        {/* Live Badge removed as requested */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 48,
    overflow: 'hidden',
    alignSelf: 'center',
    minHeight: 140,
    backgroundColor: '#FFF8F0', // Light peach background
    borderWidth: 1,
    borderColor: '#FFF1E0',
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D0 100%)',
      boxShadow: '0 20px 40px rgba(248, 157, 43, 0.08)',
    }),
    position: 'relative',
    justifyContent: 'center',
  },
  stripesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  stripe: {
    position: 'absolute',
    top: -50,
    width: 20,
    height: 300,
    backgroundColor: '#F89D2B',
    opacity: 0.05,
    transform: [{ rotate: '25deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    gap: 32,
    zIndex: 1,
  },
  bunnyContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bunnyInner: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFE8D0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    }),
  },
  bunny: {
    width: 60,
    height: 60,
  },
  sparkle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    // Typically an icon, using a placeholder color
  },
  textSection: {
    flex: 1,
    gap: 6,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orangeBar: {
    width: 24,
    height: 3,
    backgroundColor: '#F89D2B',
    borderRadius: 2,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F89D2B',
    letterSpacing: 1.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3D2B1F', // Dark brown
    fontFamily: 'Lexend, sans-serif',
    lineHeight: 34,
  },
  highlightText: {
    color: '#F89D2B',
  },
  subtitle: {
    fontSize: 15,
    color: '#A08E7E',
    fontStyle: 'italic',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
})


