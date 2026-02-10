import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import StarIcon from '../assets/icon/icon-mainflow/star.svg'
import AppIcon from '../assets/icon/icon-mainflow/app.svg'
import ChatIcon from '../assets/icon/navigate-app/folder.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import UserIcon from '../assets/user.png'
import { getCurrentUserInfo, getAuthToken } from '../app/provider/api/client'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 * - SVG components
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || typeof src === 'string') return src
  if (src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (src.default) return src.default
  // Xử lý SVG - giống như trong navigation-pill.jsx
  if (typeof src === 'object') {
    if (src.uri) return { uri: src.uri }
    if (src.source) return src.source
  }
  return src
}

/**
 * Kiểm tra xem icon có phải là React component không (SVG component)
 */
const isReactComponent = (icon) => {
  if (!icon) return false
  return (
    (typeof icon === 'function') || 
    (typeof icon === 'object' && icon.$$typeof) ||
    (typeof icon === 'object' && icon.default && (typeof icon.default === 'function' || icon.default.$$typeof))
  )
}

/**
 * Render icon - hỗ trợ cả Image source và React component (SVG)
 */
const renderIcon = (Icon, style, isActive = false) => {
  if (!Icon) return null
  
  // Kiểm tra xem icon có phải là React component không (SVG component)
  const isComponent = isReactComponent(Icon)
  
  if (isComponent) {
    // Nếu là React component (SVG component), render trực tiếp
    const IconComponent = typeof Icon === 'function' ? Icon : (Icon.default || Icon)
    return (
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <IconComponent width={24} height={24} fill="#000" />
      </View>
    )
  }
  
  // Nếu không phải component, thử dùng Image với normalizeImageSource
  const iconSource = normalizeImageSource(Icon)
  if (iconSource) {
    return (
      <Image source={iconSource} style={[styles.icon, style]} resizeMode="contain" />
    )
  }
  
  return null
}

/**
 * Navbar Mobile Component
 * - Bottom navigation bar for mobile
 * - Icons from left to right: Home - Flashcard - Menu - Blog - Profile
 */
export function NavbarMobile() {
  // Chỉ sử dụng navigation hook trên mobile
  let navigation = null
  if (Platform.OS !== 'web') {
    try {
      navigation = useNavigation()
    } catch (error) {
      // Navigation not available, continue anyway
      console.warn('NavbarMobile: Navigation not available', error)
    }
  }

  const userInfo = getCurrentUserInfo()
  const avatarUrl = userInfo?.avatarUrl

  // Hide if not logged in
  const isLoggedIn = !!getAuthToken()

  if (!isLoggedIn) {
    return null
  }

  // Try to get current route name safely
  let currentRouteName = null
  if (navigation) {
    try {
      const state = navigation.getState()
      if (state && state.routes && state.routes.length > 0) {
        const currentRoute = state.routes[state.index]
        currentRouteName = currentRoute?.name
      }
    } catch (error) {
      // Navigation state not available, continue anyway
    }
  }

  // Hide navbar on auth screens
  const hideNavbar = currentRouteName === 'login' ||
    currentRouteName === 'register' ||
    currentRouteName === 'forgot-password'

  if (hideNavbar) {
    return null
  }


  const handleHomePress = () => {
    if (!navigation) return
    try {
      navigation.navigate('home')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleStarPress = () => {
    if (!navigation) return
    try {
      navigation.navigate('study')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleFlashcardPress = () => {
    if (!navigation) return
    try {
      navigation.navigate('flashcard-list')
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
    if (!navigation) return
    try {
      navigation.navigate('blog')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleProfilePress = () => {
    if (!navigation) return
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
          {renderIcon(HomeIcon, styles.icon)}
        </TouchableOpacity>

        {/* Flashcard - Second from left */}
        <TouchableOpacity style={styles.iconButton} onPress={handleFlashcardPress} activeOpacity={0.7}>
          {renderIcon(FlashcardIcon, styles.icon)}
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
          {renderIcon(BlogIcon, styles.icon)}
        </TouchableOpacity>

        {/* Profile - Rightmost */}
        <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress} activeOpacity={0.7}>
          {avatarUrl ? (
            <Image
              source={normalizeImageSource(avatarUrl)}
              style={styles.avatarIcon}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={normalizeImageSource(UserIcon)}
              style={styles.avatarIcon}
              resizeMode="cover"
            />
          )}
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
  },
  avatarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    // Đảm bảo SVG được căn giữa
  },
  iconContainerActive: {
    backgroundColor: '#F5E6D3', // Light beige background
    borderRadius: 20,
    padding: 8,
  },
  avatarContainer: {
    padding: 4,
  },
  avatarContainerActive: {
    backgroundColor: '#F5E6D3', // Light beige background
    borderRadius: 20,
    padding: 8,
  },
  iconPlaceholder: {
    backgroundColor: '#000',
    borderRadius: 2,
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
