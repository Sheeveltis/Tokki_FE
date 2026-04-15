import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { NavbarMobile } from '../../../../../components/navbar-mobile'

export function AlphabetSelectModeLayout({ children }) {
  return (
    <View style={styles.root}>
      <NavbarMobile />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentWrapper: {
    padding: 20,
    gap: 24,
  },
})

