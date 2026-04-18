import React from 'react'
import { View, StyleSheet } from 'react-native'

export function FlashcardFirstLearnLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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


