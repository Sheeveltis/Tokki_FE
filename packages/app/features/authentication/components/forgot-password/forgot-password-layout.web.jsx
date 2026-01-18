import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * ForgotPasswordLayoutWeb: chia đôi màn hình, trái là hero, phải là form
 *
 * @param {{ hero: React.ReactNode; form: React.ReactNode }} props
 */
export const ForgotPasswordLayoutWeb = ({ hero, form }) => {
  return (
    <View style={styles.root}>
      <View style={styles.split}>
        <View style={styles.hero}>{hero}</View>
        <View style={styles.panel}>{form}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100vh',
    minHeight: '100vh',
    backgroundColor: 'white',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  split: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  hero: {
    flex: 1,
    height: '100%',
  },
  panel: {
    flex: 1,
    height: '100%',
  },
})
