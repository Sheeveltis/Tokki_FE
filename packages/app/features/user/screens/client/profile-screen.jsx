'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { UserProfileLayout as UserProfileLayoutWeb } from '../../components/client/profile/user-profile-layout.web'
import { UserProfileLayout as UserProfileLayoutNative } from '../../components/client/profile/user-profile-layout.native'

/**
 * Profile Screen
 * - Main entry point for user profile
 * - Uses platform-specific layout
 */
export function ProfileScreen() {
  const router = useRouter()

  const handleActionPress = (key) => {
    if (key === 'profile') {
      router.push('/user-profile')
    } else if (key === 'history') {
      router.push('/user-profile?tab=history')
    } else if (key === 'roadmap') {
      router.push('/roadmap')
    } else if (key === 'logout') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      router.push('/login')
    }
  }

  // Web version needs onActionPress for dashboard navigation
  // Native version doesn't need it (handled by menu-mobile)
  const LayoutComponent = Platform.select({
    web: UserProfileLayoutWeb,
    default: UserProfileLayoutNative,
  })

  return <LayoutComponent onActionPress={handleActionPress} />
}

export default ProfileScreen

