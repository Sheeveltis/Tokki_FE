import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { PaymentSuccess } from './payment-success'

/**
 * Payment Success Layout Component (Native/Mobile)
 * - Displays payment success message with icon and confetti
 * - Centered layout for mobile screens
 */
export function PaymentSuccessLayout() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.wrapper}>
        <PaymentSuccess />
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

