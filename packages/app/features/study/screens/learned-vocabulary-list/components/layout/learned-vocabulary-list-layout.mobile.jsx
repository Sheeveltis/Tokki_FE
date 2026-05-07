import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { NavbarMobile } from 'components/navbar-mobile'

/**
 * LearnedVocabularyListLayout (Mobile): Layout cho trang danh sách từ vựng đã học trên mobile
 */
export function LearnedVocabularyListLayout({ children }) {
  return (
    <LinearGradient colors={['#FEF7E6', '#FFFFFF']} locations={[0, 0.4]} style={styles.root}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
      {Platform.OS !== 'web' && <NavbarMobile />}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    paddingTop: 12,
    paddingBottom: 100, // Thêm padding bottom để tránh bị che bởi navbar
    borderRadius: 0,
    gap: 16,
  },
})

