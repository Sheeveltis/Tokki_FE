import React from 'react'
import { View, Image, StyleSheet } from 'react-native'

/**
 * LoginHero: cột bên trái màn đăng nhập
 * Hiển thị background + artwork (Learning Korean) giống mock.
 *
 * @param {{
 *  imageSource?: any          // hỗ trợ cũ: dùng làm background
 *  backgroundSource?: any     // hình background
 *  overlaySource?: any        // hình đè lên (artwork)
 * }} props
 */
export function LoginHero({ imageSource, backgroundSource, overlaySource }) {
  // Chuẩn hoá source để hỗ trợ cả import module (Next/webpack) lẫn require/uri
  const normalize = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (src.src) return { uri: src.src }
    return null
  }

  const bg = normalize(backgroundSource || imageSource)
  const overlay = normalize(overlaySource)

  return (
    <View style={styles.container}>
      {bg ? <Image source={bg} style={styles.background} /> : null}
      {overlay ? (
        <View style={styles.overlayWrapper}>
          <Image source={overlay} style={styles.overlayImage} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  overlayImage: {
    width: '120%',
    height: '120%',
    resizeMode: 'contain',
    // iOS shadow - glow effect
    shadowColor: '#F4900C',
    shadowOffset: {
      width: 20,
      height: 20,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    // Android shadow
    elevation: 8,
  },
})
