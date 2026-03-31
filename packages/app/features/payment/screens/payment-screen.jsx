import React from 'react'
import { View, ScrollView, StyleSheet, Image, Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
// Import useRoute cho native
let useRoute = null
if (Platform.OS !== 'web') {
  try {
    const navigationModule = require('@react-navigation/native')
    useRoute = navigationModule.useRoute
  } catch (e) {
    // @react-navigation/native không có sẵn trên web
  }
}
import { Navbar } from '../../../../components/navbar'
import { Footer } from '../../../../components/footer'
import { NavbarMobile } from '../../../../components/navbar-mobile'
import { PaymentLayout } from '../components/payment-detail/payment-layout'
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
 * Payment Screen Component
 * - Displays QR code payment on the left
 * - Displays bank account information on the right
 * - Divider in the middle
 * - Back button at the bottom
 */
export function PaymentScreen() {
  // Trên web: dùng useSearchParams từ solito
  // Trên native: dùng route.params từ React Navigation
  const searchParams = useSearchParams()
  const route = useRoute ? useRoute() : null
  
  // Lấy params từ searchParams (web) hoặc route.params (native)
  const paymentId = Platform.OS === 'web' 
    ? (searchParams?.get('paymentId') || null)
    : (route?.params?.paymentId || null)
  const paymentUrl = Platform.OS === 'web'
    ? (searchParams?.get('paymentUrl') || null)
    : (route?.params?.paymentUrl || null)

  return (
    <View style={styles.root}>
      {/* Background image */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={styles.backgroundImage}
      />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          <PaymentLayout paymentId={paymentId} paymentUrl={paymentUrl} />
        </View>
      </ScrollView>

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

