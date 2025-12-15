import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * FlashcardTestLayout (Web): Layout cho trang test flashcard trên web
 */
export function FlashcardTestLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    gap: 16,
    alignItems: 'stretch',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'column',
  },
})

