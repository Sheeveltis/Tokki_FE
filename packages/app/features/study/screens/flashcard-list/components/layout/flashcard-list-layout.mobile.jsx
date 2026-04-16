import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { NavbarMobile } from 'components/navbar-mobile'

/**
 * FlashcardListLayout (Mobile): Layout cho trang danh sách flashcard trên mobile
 */
export function FlashcardListLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi navbar
    borderRadius: 0,
    gap: 20,
  },
})

