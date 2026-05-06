import React from 'react'
import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export function FlashcardFirstLearnLayout({ children }) {
  return (
    <LinearGradient colors={['#FEF7E6', '#FFFFFF']} locations={[0, 0.4]} style={styles.root}>
      <View style={styles.contentWrapper}>{children}</View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 24,
    paddingBottom: 24,
    borderRadius: 0,
    gap: 16,
  },
})


