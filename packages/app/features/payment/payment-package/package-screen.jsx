import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { PaymentPackageLayout } from './components/payment-package-layout'
import { NavbarMobile } from '../../../../components/navbar-mobile'

/**
 * PackageScreen: Màn hình hiển thị các gói thanh toán
 * - Hiển thị gói miễn phí và gói premium
 * - Có nút quay lại và xem chi tiết
 */
export function PackageScreen() {
  return (
    <View style={styles.container}>
      <PaymentPackageLayout />
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
})




