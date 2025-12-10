import React from 'react'
import { View, StyleSheet, Image, ScrollView } from 'react-native'
import { ErrorView } from './components/error-view'
import BackgroundImage from '../../../assets/background2.png'

/**
 * Chuẩn hóa source ảnh để dùng được cả file tĩnh và URI.
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * Màn hình lỗi độc lập, dùng cho trang riêng biệt.
 */
export function ErrorScreen() {
  return (
    <View style={styles.root}>
      <Image source={normalizeImageSource(BackgroundImage)} style={styles.backgroundImage} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          <ErrorView />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.1, // ảnh nền mờ 10%
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
  },
  wrapper: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 16,
  },
})


