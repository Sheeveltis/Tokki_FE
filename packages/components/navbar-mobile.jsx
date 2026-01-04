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
 * - Icons from left to right: Home - Flashcard - Menu - Blog - Profile
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
    }
  } catch (error) {
    // Navigation state not available, continue anyway
    console.warn('[NavbarMobile] Could not get navigation state:', error)
  }

  // Hide navbar on auth screens
  const hideNavbar = currentRouteName === 'login' ||
    currentRouteName === 'register' ||
    currentRouteName === 'forgot-password'

  if (hideNavbar) {
    return null
  }


  const handleHomePress = () => {
    try {
      navigation.navigate('home')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleFlashcardPress = () => {
    try {
      navigation.navigate('study')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleMenuPress = () => {
    // Menu button - can be used for minigame or other features
    // For now, just a placeholder
    console.log('Menu pressed')
  }

  const handleBlogPress = () => {
    try {
      navigation.navigate('blog')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleProfilePress = () => {
    try {
      navigation.navigate('menu-mobile')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  return (
    <View style={styles.container}>
      {/* Home - Leftmost */}
        <TouchableOpacity style={styles.iconButton} onPress={handleHomePress} activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(HomeIcon)}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Flashcard - Second from left */}
        <TouchableOpacity style={styles.iconButton} onPress={handleFlashcardPress} activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(FlashcardIcon)}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Menu - Center */}
        <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress} activeOpacity={0.7}>
          <View style={styles.menuIconContainer}>
            <View style={styles.menuIconGrid}>
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Blog - Second from right */}
        <TouchableOpacity style={styles.iconButton} onPress={handleBlogPress} activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(BlogIcon)}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profile - Rightmost */}
        <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress} activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(avatarUrl || UserIcon)}
            style={styles.avatarIcon}
            resizeMode="cover"
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
    backgroundColor: '#FFD700', // Yellow background
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
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconGrid: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
})
