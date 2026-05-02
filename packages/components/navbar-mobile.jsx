import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import MicrophoneIcon from '../assets/icon/navigate-app/layers-svgrepo-com.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import UserIcon from '../assets/icon/navigate-app/user-svgrepo-com.svg'
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
const renderIcon = (Icon, style, isActive = false, activeColor = '#78905E') => {
  if (!Icon) return null
  
  const tint = isActive ? activeColor : '#6A5634'
  
  // Kiểm tra xem icon có phải là React component không (SVG component)
  const isComponent = isReactComponent(Icon)
  
  if (isComponent) {
    // Nếu là React component (SVG component), render trực tiếp
    const IconComponent = typeof Icon === 'function' ? Icon : (Icon.default || Icon)
    return (
      <View style={[styles.iconContainer, isActive && { backgroundColor: activeColor + '20', borderRadius: 15 }]}>
        <IconComponent width={30} height={30} fill={tint} color={tint} />
      </View>
    )
  }
  
  // Nếu không phải component, thử dùng Image với normalizeImageSource
  const iconSource = normalizeImageSource(Icon)
  if (iconSource) {
    return (
      <View style={[styles.iconContainer, isActive && { backgroundColor: activeColor + '20', borderRadius: 15 }]}>
        <Image source={iconSource} style={[{ width: 30, height: 30 }, style, { tintColor: tint }]} resizeMode="contain" />
      </View>
    )
  }
  
  return null
}

/**
 * Navbar Mobile Component
 * - Bottom navigation bar for mobile
 * - Icons from left to right: Home - Flashcard - Menu - Blog - Profile
 */
export function NavbarMobile({ 
  onHomePress, 
  onFlashcardPress, 
  onBlogPress, 
  onProfilePress,
  onMenuPress 
}) {
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
    if (onHomePress) {
      onHomePress()
      return
    }
    if (!navigation) return
    try {
      navigation.navigate('minigame')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleFlashcardPress = () => {
    if (onFlashcardPress) {
      onFlashcardPress()
      return
    }
    if (!navigation) return
    try {
      navigation.navigate('flashcard-list')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress()
      return
    }
    if (!navigation) return
    try {
      navigation.navigate('pronunciation-rules')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleBlogPress = () => {
    if (onBlogPress) {
      onBlogPress()
      return
    }
    if (!navigation) return
    try {
      navigation.navigate('blog-list')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress()
      return
    }
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
          {renderIcon(HomeIcon, styles.icon, currentRouteName === 'minigame', '#5E794E')}
        </TouchableOpacity>

        {/* Flashcard - Second from left */}
        <TouchableOpacity style={styles.iconButton} onPress={handleFlashcardPress} activeOpacity={0.7}>
          {renderIcon(FlashcardIcon, styles.icon, currentRouteName === 'flashcard-list', '#F4900C')}
        </TouchableOpacity>

        {/* Pronunciation AI - Center */}
        <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress} activeOpacity={0.7}>
          {renderIcon(MicrophoneIcon, styles.icon, currentRouteName === 'pronunciation-rules', '#4834D4')}
        </TouchableOpacity>


        {/* Blog - Second from right */}
        <TouchableOpacity style={styles.iconButton} onPress={handleBlogPress} activeOpacity={0.7}>
          {renderIcon(BlogIcon, styles.icon, currentRouteName === 'blog-list', '#DD9B9D')}
        </TouchableOpacity>

        {/* Profile - Rightmost */}
        <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress} activeOpacity={0.7}>
          {avatarUrl ? (
            <View style={[styles.avatarContainer, currentRouteName === 'menu-mobile' && { backgroundColor: '#89A455' + '20', borderRadius: 15 }]}>
              <Image
                source={normalizeImageSource(avatarUrl)}
                style={styles.avatarIcon}
                resizeMode="cover"
              />
            </View>
          ) : (
            renderIcon(UserIcon, styles.icon, currentRouteName === 'menu-mobile', '#89A455')
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
    backgroundColor: 'rgba(255, 248, 231, 0.95)', // Match web header color closely but enough opacity for mobile readability
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 -2px 4px rgba(0,0,0,0.1)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
        }),
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
    width: 50,
    height: 50,
  },
  avatarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#F5E6D3',
    borderRadius: 15,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainerActive: {
    backgroundColor: '#F5E6D3',
    borderRadius: 15,
  },
  iconPlaceholder: {
    backgroundColor: '#000',
    borderRadius: 2,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF9E1',
    borderRadius: 12,
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000',
  },
})
