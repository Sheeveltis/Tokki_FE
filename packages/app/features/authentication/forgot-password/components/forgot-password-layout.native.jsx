import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * Native placeholder layout cho forgot-password
 */
export const ForgotPasswordLayoutNative = ({ form }) => {
  return <View style={styles.container}>{form}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
})

