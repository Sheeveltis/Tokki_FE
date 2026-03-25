import React from 'react'
import { View, StyleSheet } from 'react-native'
import { NavbarMobile } from '../components/navbar-mobile'

/**
 * FlashcardLearnLayout (Mobile): Layout cho trang học flashcard trên mobile
 */
export function FlashcardLearnLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
      <NavbarMobile />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative', // Cần để navbar absolute hoạt động đúng
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingBottom: 100, // Padding bottom để tránh bị che bởi navbar
    borderRadius: 16,
  },
})

