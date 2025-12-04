import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * AuthLayout: layout chia đôi màn hình cho hero (bên trái) và panel (bên phải)
 *
 * @param {{
 *   hero: React.ReactNode
 *   panel: React.ReactNode
 * }} props
 */
export function AuthLayout({ hero, panel }) {
  return (
    <View style={styles.root}>
      <View style={styles.split}>
        <View style={styles.hero}>{hero}</View>
        <View style={styles.panel}>{panel}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
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
  },
})


