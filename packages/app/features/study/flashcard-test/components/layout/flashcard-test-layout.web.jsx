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
    width: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    // Bám từ trên xuống, tránh lộ nền tối bên dưới khi nội dung thấp
    justifyContent: 'flex-start',
    paddingVertical: 32,
    paddingHorizontal: 16,
    minHeight: '100vh',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1200,
    minHeight: '70vh', // đủ cao cho trạng thái trống/kết thúc
    gap: 16,
    alignItems: 'stretch',
    backgroundColor: '#F5F0DD',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
})

