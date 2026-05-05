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
export function PaymentScreen({ onBackPress }) {
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
      {/* Nội dung chính */}
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <PaymentLayout 
            paymentId={paymentId} 
            paymentUrl={paymentUrl} 
            onBackPress={onBackPress}
          />
        </View>
      </View>

      {/* NavbarMobile chỉ hiển thị trên native */}
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFDF9', // Soft cream background
    position: 'relative',
  },
  container: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    paddingVertical: 60,
  },
  wrapper: {
    width: '100%',
    maxWidth: 1100,
    paddingHorizontal: 20,
  },
})

