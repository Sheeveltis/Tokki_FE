import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { NavbarMobile } from '../components/navbar-mobile'

/**
 * StudySelectionLayout (Mobile): Bố cục trang chọn lộ trình học cho mobile
 */
export function StudySelectionLayout({ 
  children, 
  onQuickTestPress, 
  lessonsLearned, 
  streakDays 
}) {
  return (
    <View style={styles.root}>
      <NavbarMobile />
      
      {/* Content chính trong ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    position: 'relative',
  },
  scrollContent: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
  centerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

