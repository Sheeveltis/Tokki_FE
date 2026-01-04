import React from 'react'
import { View, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import StarIcon from '../assets/icon/icon-mainflow/star.svg'
import AppIcon from '../assets/icon/icon-mainflow/app.svg'
import ChatIcon from '../assets/icon/navigate-app/folder.svg'
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
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive, style]}>
        <IconComponent width={40} height={40} fill="#000" />
      </View>
    )
  }
  
  // Nếu không phải component, thử dùng Image với normalizeImageSource
  const iconSource = normalizeImageSource(Icon)
  if (iconSource) {
    return (
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <Image source={iconSource} style={[styles.icon, style]} resizeMode="contain" />
      </View>
    )
  }
  
  return null
}

/**
 * Navbar Mobile Component
 * - Bottom navigation bar for mobile
 * - Icons from left to right: Home - Star (Favorites) - App (Study Menu) - Folder (Flashcard) - User
 * - Active state: Icon được select sẽ có background beige rounded square
 */
export function NavbarMobile() {
  const navigation = useNavigation()
  const userInfo = getCurrentUserInfo()
  const avatarUrl = userInfo?.avatarUrl
  
  // Hide if not logged in
  const isLoggedIn = !!getAuthToken()
  
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
  }
  
  // Hide navbar on auth screens
  const hideNavbar = currentRouteName === 'login' || 
                     currentRouteName === 'register' || 
                     currentRouteName === 'forgot-password'
  
  // Tạm thời hiển thị navbar ngay cả khi chưa đăng nhập để test
  // if (!isLoggedIn) {
  //   return null
  // }
  
  if (hideNavbar) {
    return null
  }

  // Xác định route hiện tại thuộc nhóm nào
  const isHomeActive = currentRouteName === 'home'
  
  const isStarActive = currentRouteName === 'star' || 
                       currentRouteName === 'favorites' ||
                       (currentRouteName && currentRouteName.includes('favorite'))
  
  // App (Study menu) - các route liên quan đến study nhưng không phải flashcard
  const isAppActive = currentRouteName === 'study' ||
                      currentRouteName === 'menu-study' ||
                      currentRouteName === 'study-selection' ||
                      (currentRouteName && (
                        currentRouteName.includes('alphabet') ||
                        currentRouteName.includes('listening') ||
                        currentRouteName.includes('speaking') ||
                        currentRouteName.includes('reading') ||
                        currentRouteName.includes('writing') ||
                        currentRouteName.includes('grammar')
                      ))
  
  // Folder (Flashcard) - các route flashcard
  const isFlashcardActive = currentRouteName === 'flashcard-list' ||
                            currentRouteName === 'flashcard-learn' ||
                            currentRouteName === 'flashcard-study' ||
                            currentRouteName === 'flashcard-test' ||
                            (currentRouteName && currentRouteName.includes('flashcard'))
  
  // User
  const isUserActive = currentRouteName === 'user-profile' ||
                       currentRouteName === 'user-detail' ||
                       (currentRouteName && currentRouteName.includes('user'))

  const handleHomePress = () => {
    try {
      // Navigate to home screen
      // Note: Need to add 'home' screen to navigation stack
      navigation.navigate('home')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleStarPress = () => {
    try {
      // Navigate to star/favorites screen
      // Note: Need to add 'star' or 'favorites' screen to navigation stack
      navigation.navigate('star')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleAppPress = () => {
    try {
      // Navigate to study menu screen
      navigation.navigate('menu-study')
    } catch (error) {
      console.error('Navigation error:', error)
    }
  }

  const handleChatPress = () => {
    try {
      // Navigate to flashcard list screen
      navigation.navigate('flashcard-list')
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
      {/* Home - Leftmost (Icon 1) */}
      <TouchableOpacity style={styles.iconButton} onPress={handleHomePress} activeOpacity={0.7}>
        {renderIcon(HomeIcon, styles.icon, isHomeActive)}
      </TouchableOpacity>

      {/* Star - Second from left (Icon 2) */}
      <TouchableOpacity style={styles.iconButton} onPress={handleStarPress} activeOpacity={0.7}>
        {renderIcon(StarIcon, styles.icon, isStarActive)}
      </TouchableOpacity>

      {/* App - Center (Icon 3) */}
      <TouchableOpacity style={styles.iconButton} onPress={handleAppPress} activeOpacity={0.7}>
        {renderIcon(AppIcon, styles.icon, isAppActive)}
      </TouchableOpacity>

      {/* Folder (Flashcard) - Second from right (Icon 4) */}
      <TouchableOpacity style={styles.iconButton} onPress={handleChatPress} activeOpacity={0.7}>
        {renderIcon(ChatIcon, styles.icon, isFlashcardActive)}
      </TouchableOpacity>

      {/* User - Rightmost (Icon 5) */}
      <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress} activeOpacity={0.7}>
        <View style={[styles.avatarContainer, isUserActive && styles.avatarContainerActive]}>
          <Image
            source={normalizeImageSource(avatarUrl || UserIcon)}
            style={styles.avatarIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F1BE4B', // Yellow background like in the image
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
  avatarIcon: {
    width: 60,
    height: 40,
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
})

