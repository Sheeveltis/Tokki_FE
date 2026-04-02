import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'

/**
 * AlphabetSelectModeLayout (Web): Layout cho trang chọn học phần chữ cái Hàn Quốc trên web
 */
export function AlphabetSelectModeLayout({ children }) {
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
    minHeight: '100vh',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    gap: 32,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingTop: 32,
    paddingBottom: 100,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
})

