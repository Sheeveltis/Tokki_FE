import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PaymentFailed } from './payment-failed'

/**
 * Payment Failed Layout Component (Web)
 * - Displays payment failed message with icon
 */
export function PaymentFailedLayout() {
  return (
    <View style={styles.container}>
      <PaymentFailed />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
})

