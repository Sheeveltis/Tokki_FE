import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navbar } from 'components/navbar'

/**
 * FlashcardStudyLayout (Mobile): Layout cho trang học flashcard trên mobile
 */
export function FlashcardStudyLayout({ children }) {
  return (
    <View style={styles.root}>
      <Navbar />
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
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    borderRadius: 16,
  },
})

