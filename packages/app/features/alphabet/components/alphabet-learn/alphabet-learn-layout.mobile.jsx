import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * AlphabetLearnLayout (Mobile): Layout cho trang học chữ cái Hàn Quốc trên mobile
 */
export function AlphabetLearnLayout({ children }) {
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
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    borderRadius: 16,
  },
})

