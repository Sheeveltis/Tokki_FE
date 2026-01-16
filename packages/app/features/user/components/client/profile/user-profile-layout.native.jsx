import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { UserInformation } from './user-information'
import { NavbarMobile } from '../../../../../../components/navbar-mobile'

/**
 * User Profile Layout (Native/Mobile)
 * - Single column layout optimized for mobile
 * - Includes NavbarMobile at bottom
 */
export function UserProfileLayout() {
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <UserInformation />
      </ScrollView>

      {/* NavbarMobile */}
      {Platform.OS !== 'web' && <NavbarMobile />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Padding for navbar
  },
})

