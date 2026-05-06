import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { PremiumPackageLayout } from '../components/premium-package/premium-package-layout.web'
import { NavbarMobile } from '../../../../components/navbar-mobile'

/**
 * PremiumScreen: Màn hình chọn gói premium
 * - Hiển thị thông tin gói premium bên trái
 * - Hiển thị các tùy chọn gói bên phải
 * - Có nút quay lại
 */
export function PremiumScreen({ onBackPress }) {
  return (
    <View style={styles.container}>
      <PremiumPackageLayout onBackPress={onBackPress} />
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


