import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PaymentSuccess } from './payment-success'

/**
 * Payment Success Layout Component (Web)
 * - Displays payment success message with icon and confetti
 */
export function PaymentSuccessLayout() {
  return (
    <View style={styles.container}>
      <PaymentSuccess />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
})

