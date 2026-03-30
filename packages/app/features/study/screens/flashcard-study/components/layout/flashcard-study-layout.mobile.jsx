import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { NavbarMobile } from 'components/navbar-mobile'

/**
 * FlashcardStudyLayout (Mobile): Layout cho trang học flashcard trên mobile
 */
export function FlashcardStudyLayout({ children }) {
  return (
    <View style={styles.root}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {children}
        </View>
      </ScrollView>
      <NavbarMobile />
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    position: 'relative', // Cần để navbar absolute hoạt động đúng
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    alignItems: 'center',
    paddingBottom: 100, // Padding bottom để tránh bị che bởi navbar
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 24,
    borderRadius: 0,
  },
})

