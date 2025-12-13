import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * AlphabetTypingLayout (Mobile): Layout cho trang tập đánh chữ cái Hàn Quốc trên mobile
 */
export function AlphabetTypingLayout({ children }) {
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
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    borderRadius: 16,
  },
})

