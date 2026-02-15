import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'

/**
 * AlphabetSelectModeLayout (Mobile): Layout cho trang chọn học phần chữ cái Hàn Quốc trên mobile
 */
export function AlphabetSelectModeLayout({ children }) {
  return (
    <View style={styles.root}>
      <Navbar />
      <View style={styles.contentWrapper}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    minHeight: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 24,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingTop: 32,
    paddingBottom: 48,
    borderRadius: 16,
  },
})

