import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
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
      <View style={styles.content}>
        <UserInformation />
      </View>

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
  content: {
    flex: 1,
    paddingBottom: 100, // space for navbar
    overflow: 'hidden',
  },
})

