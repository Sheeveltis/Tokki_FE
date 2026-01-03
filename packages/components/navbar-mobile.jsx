import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import UserIcon from '../assets/user.png'
import { getCurrentUserInfo, getAuthToken } from '../app/provider/api/client'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * Navbar Mobile Component
 * - Bottom navigation bar for mobile
 * - Icons from left to right: Avatar (Profile) - Blog - (Empty) - Flashcard - Home
 */
export function NavbarMobile() {
  const navigation = useNavigation()
  const userInfo = getCurrentUserInfo()
  const avatarUrl = userInfo?.avatarUrl
  
  // Hide if not logged in
  const isLoggedIn = !!getAuthToken()
  
  if (!isLoggedIn) {
    return null
  }
  
  // Try to get current route name safely
  let currentRouteName = null
  try {
    const state = navigation.getState()
    if (state && state.routes && state.routes.length > 0) {
      const currentRoute = state.routes[state.index]
      currentRouteName = currentRoute?.name
      console.log('[NavbarMobile] Current route:', currentRouteName)
    }
  } catch (error) {
    // Navigation state not available, continue anyway
    console.warn('[NavbarMobile] Could not get navigation state:', error)
  }
  
  // Hide navbar on auth screens
  const hideNavbar = currentRouteName === 'login' || 
                     currentRouteName === 'register' || 
                     currentRouteName === 'forgot-password'
  
  console.log('[NavbarMobile] isLoggedIn:', isLoggedIn, 'hideNavbar:', hideNavbar, 'currentRouteName:', currentRouteName)
  
  if (hideNavbar) {
    return null
  }

  const handleHomePress = () => {
    try {
      // Navigate to home screen
      // Note: Need to add 'home' screen to navigation stack
      navigation.navigate('home')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleFlashcardPress = () => {
    try {
      // Navigate to study/flashcard screen
      // Note: Need to add 'study' screen to navigation stack
      navigation.navigate('study')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleBlogPress = () => {
    try {
      // Navigate to blog list screen
      // Note: Need to add 'blog' screen to navigation stack
      navigation.navigate('blog')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleProfilePress = () => {
    try {
      navigation.navigate('user-profile')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Avatar (Profile) - Leftmost */}
      <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress} activeOpacity={0.7}>
        <Image
          source={normalizeImageSource(avatarUrl || UserIcon)}
          style={styles.avatarIcon}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Blog - Second from left */}
      <TouchableOpacity style={styles.iconButton} onPress={handleBlogPress} activeOpacity={0.7}>
        <Image
          source={normalizeImageSource(BlogIcon)}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Empty space in the middle - can add minigame or other icon later */}
      <View style={styles.iconButton} />

      {/* Flashcard - Second from right */}
      <TouchableOpacity style={styles.iconButton} onPress={handleFlashcardPress} activeOpacity={0.7}>
        <Image
          source={normalizeImageSource(FlashcardIcon)}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Home - Rightmost */}
      <TouchableOpacity style={styles.iconButton} onPress={handleHomePress} activeOpacity={0.7}>
        <Image
          source={normalizeImageSource(HomeIcon)}
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFD700', // Yellow background like in the image
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#000', // Black icons
  },
  avatarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#E0E0E0',
  },
})

