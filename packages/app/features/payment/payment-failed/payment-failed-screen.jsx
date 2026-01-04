import React from 'react'
import { View, ScrollView, StyleSheet, Image, Platform } from 'react-native'
import { Navbar } from '../../../../components/navbar'
import { Footer } from '../../../../components/footer'
import { NavbarMobile } from '../../../../components/navbar-mobile'
import { PaymentFailedLayout } from './components/payment-failed-layout'
import BackgroundImage from '../../../../assets/background1.png'

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
 * Payment Failed Screen Component
 * - Displays payment failed message
 */
export function PaymentFailedScreen() {
  return (
    <View style={styles.root}>
      {/* Background image */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={styles.backgroundImage}
      />

      {/* Navbar ở đầu trang */}
      <Navbar />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          <PaymentFailedLayout />
        </View>
      </ScrollView>

      {/* Footer chỉ hiển thị trên web */}
      {Platform.OS === 'web' && <Footer />}
      
      {/* NavbarMobile chỉ hiển thị trên native */}
      {Platform.OS !== 'web' && <NavbarMobile />}
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
    opacity: 0.3,
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: Platform.OS === 'web' ? 60 : 100, // Extra padding on native for navbar
  },
  wrapper: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 16,
  },
})

