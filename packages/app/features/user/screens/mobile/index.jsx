import React from 'react'
import { Platform } from 'react-native'
import { MenuMobileScreen } from './menu-mobile-screen.native'

/**
 * Menu Mobile Screen Entry Point
 * - Uses native version for mobile
 * - Can add web version later if needed
 */
export function MenuMobileScreenWrapper() {
  if (Platform.OS === 'web') {
    // For web, redirect to regular profile screen
    // This can be implemented later if needed
    return null
  }

  return <MenuMobileScreen />
}

export default MenuMobileScreenWrapper

