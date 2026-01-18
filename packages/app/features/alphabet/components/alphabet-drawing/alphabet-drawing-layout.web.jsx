import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * AlphabetDrawingLayout (Web): Layout cho trang tập vẽ chữ cái Hàn Quốc trên web
 * Giữ style tương tự các alphabet-* layout khác để đồng bộ giao diện.
 */
export function AlphabetDrawingLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>{children}</View>
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
    width: '70%',
    maxWidth: 1200,
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
})





