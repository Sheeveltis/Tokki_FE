import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { colors } from '../../../color'
import { normalizeImageSource } from '../api'

import BunnyIcon from '../../../../assets/bunny/1.png'

/**
 * QuickLevelTestButton: Nút kiểm tra level nhanh
 * @param {{
 *   onPress?: () => void
 * }} props
 */
export function QuickLevelTestButton({ onPress }) {
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
    >
      {/* Hình tròn ở dưới/trái */}
      <View style={styles.circleContainer}>
        <Image
          source={normalizeImageSource(BunnyIcon)}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {/* Hình chữ nhật nằm lệch lên trên bên phải */}
      <View style={styles.rectangleContainer}>
        <Text style={styles.buttonText}>KIỂM TRA LEVEL NHANH</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 250,
    height: 200,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  circleContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFD699',
    backgroundColor: '#FFF4E6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#00000015',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  rectangleContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FFD699',
    zIndex: 1,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#00000015',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }),
  },
  icon: {
    width: 80,
    height: 80,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

