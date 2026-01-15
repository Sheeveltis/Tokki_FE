import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'

import BunnyIcon from '../../../../../assets/bunny/1.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

// MinigameHappy: thẻ hiển thị "Trò chơi vui nhộn"
// Giống layout QuickLevelTestButton nhưng chỉ là component hiển thị, không có onPress
export function MinigameHappy() {
  return (
    <View
      style={styles.container}
      // không truyền onPress, chỉ hiển thị nên không phải button
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
        <Text style={styles.text}>Trò chơi vui nhộn</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 250,
    height: 200,
    ...(Platform.OS === 'web' && {
      // vì chỉ hiển thị nên không dùng pointer cursor
      cursor: 'default',
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
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  rectangleContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#FFD699',
    zIndex: 1,
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  icon: {
    width: 80,
    height: 80,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D32F2F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})


