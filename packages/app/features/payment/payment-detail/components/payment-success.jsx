import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import SuccessIcon from '../../../../../assets/success.png'

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
 * Payment Success Component
 * - Displays success icon with confetti
 * - Shows success message and contact information
 */
export const PaymentSuccess = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Success Icon Container */}
      <View style={styles.iconContainer}>
        {/* Confetti shapes around the icon */}
        <View style={[styles.confetti, styles.confetti1]} />
        <View style={[styles.confetti, styles.confetti2]} />
        <View style={[styles.confetti, styles.confetti3]} />
        <View style={[styles.confetti, styles.confetti4]} />
        <View style={[styles.confetti, styles.confetti5]} />
        <View style={[styles.confetti, styles.confetti6]} />
        <View style={[styles.confetti, styles.confetti7]} />
        <View style={[styles.confetti, styles.confetti8]} />
        <View style={[styles.confetti, styles.confetti9]} />
        <View style={[styles.confetti, styles.confetti10]} />
        <View style={[styles.confetti, styles.confetti11]} />
        <View style={[styles.confetti, styles.confetti12]} />

        {/* Success Icon */}
        <Image
          source={normalizeImageSource(SuccessIcon)}
          style={styles.successIcon}
          resizeMode="contain"
        />
      </View>

      {/* Success Title */}
      <Text style={styles.title}>THANH TOÁN THÀNH CÔNG</Text>

      {/* Thank you message */}
      <Text style={styles.message}>
        Cảm ơn quý khách vì đã sử dụng dịch vụ của chúng tôi
      </Text>

      {/* Contact information */}
      <Text style={styles.contact}>
        *Nếu có vấn đề xin hãy liên hệ cho chúng tôi : 0368182797
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
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  successIcon: {
    width: 700,
    height: 700,
    zIndex: 2,
  },
  // Confetti styles - colorful shapes around the icon
  confetti: {
    position: 'absolute',
    zIndex: 1,
  },
  confetti1: {
    // Light blue star (top-left)
    top: 10,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: '#87CEEB',
    borderRadius: 20,
    transform: [{ rotate: '45deg' }],
  },
  confetti2: {
    // Light green rectangle (left)
    top: 60,
    left: 10,
    width: 32,
    height: 48,
    backgroundColor: '#90EE90',
  },
  confetti3: {
    // Orange circle (bottom-left)
    bottom: 30,
    left: 30,
    width: 36,
    height: 36,
    backgroundColor: '#FFA500',
    borderRadius: 18,
  },
  confetti4: {
    // White asterisk (bottom-left)
    bottom: 20,
    left: 15,
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  confetti5: {
    // Light pink crescent (bottom-left)
    bottom: 50,
    left: 50,
    width: 28,
    height: 28,
    backgroundColor: '#FFB6C1',
    borderRadius: 14,
  },
  confetti6: {
    // Light green rectangle (bottom-right)
    bottom: 40,
    right: 20,
    width: 36,
    height: 44,
    backgroundColor: '#98FB98',
  },
  confetti7: {
    // Orange star (bottom-right)
    bottom: 15,
    right: 40,
    width: 32,
    height: 32,
    backgroundColor: '#FF8C00',
    borderRadius: 16,
    transform: [{ rotate: '45deg' }],
  },
  confetti8: {
    // White circle (right)
    top: 50,
    right: 15,
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  confetti9: {
    // Light pink crescent (right)
    top: 80,
    right: 30,
    width: 24,
    height: 24,
    backgroundColor: '#FFC0CB',
    borderRadius: 12,
  },
  confetti10: {
    // Light green crescent (top-right)
    top: 20,
    right: 50,
    width: 32,
    height: 32,
    backgroundColor: '#ADFF2F',
    borderRadius: 16,
  },
  confetti11: {
    // Small blue circle (top-right)
    top: 5,
    right: 25,
    width: 20,
    height: 20,
    backgroundColor: '#87CEFA',
    borderRadius: 10,
  },
  confetti12: {
    // Light pink rectangle (top-right)
    top: 35,
    right: 10,
    width: 28,
    height: 36,
    backgroundColor: '#FFB6C1',
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
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  contact: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Epilogue, sans-serif',
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
})

