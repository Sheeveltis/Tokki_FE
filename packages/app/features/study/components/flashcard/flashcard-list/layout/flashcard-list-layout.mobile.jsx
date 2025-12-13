import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navbar } from 'components/navbar'

/**
 * FlashcardListLayout (Mobile): Layout cho trang danh sách flashcard trên mobile
 */
export function FlashcardListLayout({ children }) {
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
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    borderRadius: 16,
    gap: 16,
  },
})

