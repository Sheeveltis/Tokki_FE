import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { NavbarMobile } from '../../../../../../components/navbar-mobile'

export function FlashcardFirstLearnLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>{children}</View>
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 24,
    paddingBottom: 100,
    borderRadius: 0,
    gap: 16,
  },
})


