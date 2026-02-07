import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navbar } from '../../../../../components/navbar'

/**
 * AlphabetStudyLayout (Mobile): Layout cho trang học chữ cái Hàn Quốc trên mobile
 */
export function AlphabetStudyLayoutMobile({ children }) {
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
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '90%',
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
})

