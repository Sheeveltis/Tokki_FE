import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { PaymentFailed } from './payment-failed'

/**
 * Payment Failed Layout Component (Native/Mobile)
 * - Displays payment failed message with icon
 * - Centered layout for mobile screens
 */
export function PaymentFailedLayout() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.wrapper}>
        <PaymentFailed />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  wrapper: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
})

