import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { PaymentPackageLayout } from '../components/payment-package/payment-package-layout.web'
// Footer is hidden via PublicLayout in public.routes.jsx for web
// and by not rendering NavbarMobile for native

/**
 * PackageScreen: Màn hình hiển thị các gói thanh toán
 * - Hiển thị gói miễn phí và gói premium
 * - Có nút quay lại và xem chi tiết
 */
export function PackageScreen({ onBackPress }) {
  return (
    <View style={styles.container}>
      <PaymentPackageLayout onBackPress={onBackPress} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
})




