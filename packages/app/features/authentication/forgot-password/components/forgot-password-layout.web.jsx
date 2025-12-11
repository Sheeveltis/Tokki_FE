import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * ForgotPasswordLayoutWeb: chia đôi màn hình, trái là hero, phải là form
 *
 * @param {{ hero: React.ReactNode; form: React.ReactNode }} props
 */
export const ForgotPasswordLayoutWeb = ({ hero, form }) => {
  return (
    <View style={styles.container}>
      <View style={styles.split}>
        <View style={styles.hero}>{hero}</View>
        <View style={styles.panel}>{form}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  split: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  hero: {
    flex: 1,
  },
  panel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
})

