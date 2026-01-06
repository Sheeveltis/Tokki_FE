import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * FlashcardLearnLayout (Web): Layout cho trang học flashcard trên web
 */
export function FlashcardLearnLayout({ children }) {
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
    // Căn nội dung từ trên xuống để nút "Trở lại" nằm sát phía trên
    justifyContent: 'flex-start',
    paddingVertical: 32,
    minHeight: '100vh', // phủ đầy màn hình, tránh lộ nền tối bên dưới
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1200,
    minHeight: '70vh', // đảm bảo khối nội dung đủ cao khi trạng thái trống/hoàn thành
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    // Căn nội dung từ trên xuống, để header + nút "Trở lại" nằm trên
    justifyContent: 'flex-start',
    paddingVertical: 32,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
})

