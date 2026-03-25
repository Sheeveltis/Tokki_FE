import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { NavbarMobile } from '../components/navbar-mobile'

/**
 * LearnedVocabularyListLayout (Mobile): Layout cho trang danh sách từ vựng đã học trên mobile
 */
export function LearnedVocabularyListLayout({ children }) {
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
    backgroundColor: '#F5F0DD',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 24,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi navbar
    borderRadius: 0,
    gap: 16,
  },
})

