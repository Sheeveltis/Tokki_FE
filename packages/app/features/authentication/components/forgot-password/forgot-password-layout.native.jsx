import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * ForgotPasswordLayoutNative: layout cho native (full screen form)
 *
 * @param {{ hero: React.ReactNode; form: React.ReactNode }} props
 */
export const ForgotPasswordLayoutNative = ({ hero, form }) => {
  return (
    <View style={styles.container}>
      {hero}
      {form}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
})
