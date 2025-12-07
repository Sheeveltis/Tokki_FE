import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import FailIcon from '../../../../../assets/fail.png'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
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
 * Payment Failed Component
 * - Displays failed icon
 * - Shows failure message and contact information
 */
export const PaymentFailed = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Failed Icon Container */}
      <View style={styles.iconContainer}>
        {/* Failed Icon */}
        <Image
          source={normalizeImageSource(FailIcon)}
          style={styles.failIcon}
          resizeMode="contain"
        />
      </View>

      {/* Failed Title */}
      <Text style={styles.title}>THANH TOÁN THẤT BẠI</Text>

      {/* Apology message */}
      <Text style={styles.message}>
        Xin lỗi quý khách vì sự cố bất tiện này xin hãy liên hệ tại đây để nhận được sự hỗ trợ
      </Text>

      {/* Contact information */}
      <Text style={styles.contact}>
        Hãy liên hệ cho chúng tôi : 0368182797
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  failIcon: {
    width: 400,
    height: 400,
    zIndex: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Lexend, sans-serif',
    color: '#8B0000', // Dark red/maroon color
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Epilogue, sans-serif',
    color: '#8B0000', // Dark red/maroon color
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  contact: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Epilogue, sans-serif',
    color: '#8B0000', // Dark red/maroon color
    textAlign: 'center',
    lineHeight: 24,
  },
})

