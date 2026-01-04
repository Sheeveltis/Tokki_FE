import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { PaymentHistoryContent } from './PaymentHistoryContent'
import { NavbarMobile } from '../../../../../../components/navbar-mobile'

/**
 * Payment History Layout (Native/Mobile)
 * - Single column layout optimized for mobile
 * - Includes NavbarMobile at bottom
 */
export function PaymentHistoryLayout({ payments, loading, error }) {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PaymentHistoryContent payments={payments} loading={loading} error={error} />
      </ScrollView>

      {/* NavbarMobile */}
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Padding for navbar
  },
})

