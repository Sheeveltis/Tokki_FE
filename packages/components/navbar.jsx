import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native'
import { colors } from '../app/color'
import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo-text.png'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import RoadmapIcon from '../assets/icon/navigate-app/book.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import SmallFoot from '../assets/smallfoot.png'
import RoadmapImage from '../assets/roadmap.png'
import { useRouter } from 'solito/navigation'
import UserIcon from '../assets/user.png'
import LogoutIcon from '../assets/icon/icon-mainflow/logout.svg'
import { MessageModal } from './MessageModal'
import { getAuthToken, clearAuthToken, getCurrentUserId } from '../app/provider/api/client'
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
 * Navbar component with Tokki branding and navigation
 * 
 * @param {{
 *   logoImage?: any;
 *   pawPrintImage?: any;
 *   homeIcon?: any;
 *   roadmapIcon?: any;
 *   flashcardIcon?: any;
 *   blogIcon?: any;
 *   profileIcon?: any;
 *   onHomePress?: () => void;
 *   onRoadmapPress?: () => void;
 *   onFlashcardPress?: () => void;
 *   onBlogPress?: () => void;
 *   onLoginPress?: () => void;
 *   onRegisterPress?: () => void;
 *   style?: any;
 *   position?: 'fixed' | 'relative' | 'absolute';
 * }} props
 */
export const Navbar = ({
  homeIcon,
  roadmapIcon,
  flashcardIcon,
  blogIcon,
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onLoginPress,
  onRegisterPress,
  style,
  position = 'fixed',
}) => {
  const router = useRouter()
  const [hasToken, setHasToken] = useState(false)
  const [homeHover, setHomeHover] = useState(false)
  const [roadmapHover, setRoadmapHover] = useState(false)
  const [flashcardHover, setFlashcardHover] = useState(false)
  const [blogHover, setBlogHover] = useState(false)
  const [userHover, setUserHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  const [roadmapInfoHover, setRoadmapInfoHover] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Detect token in localStorage (web) - sử dụng getAuthToken để tự động giải mã
  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkToken = () => {
      // Sử dụng getAuthToken để tự động giải mã token
      const token = getAuthToken()
      setHasToken(!!token)
    }
    checkToken()
    const onStorage = (e) => {
      if (e.key === 'token') {
        checkToken()
      }
    }
    const onTokenChanged = () => checkToken()
    window.addEventListener('storage', onStorage)
    window.addEventListener('token-changed', onTokenChanged)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('token-changed', onTokenChanged)
    }
  }, [])

  // Prefetch các route chính để giảm độ trễ khi điều hướng (web)
  useEffect(() => {
    if (!router?.prefetch) return
    const routesToPrefetch = ['/homepage', '/study', '/flashcard', '/blog', '/roadmap/info', '/login', '/register']
    routesToPrefetch.forEach((r) => {
      router.prefetch(r).catch(() => {})
    })
  }, [router])

  // Handler functions với fallback routing
  const go = useCallback((path, fallback) => {
    if (path) return () => router.push(path)
    return fallback
  }, [router])

  const handleHomePress = onHomePress || go('/homepage')
  const handleRoadmapPress = onRoadmapPress || go('/study')
  const handleRoadmapInfoPress = go('/roadmap/info')
  const handleFlashcardPress = onFlashcardPress || go('/flashcard')
  const handleBlogPress = onBlogPress || go('/blog')
  const handleLoginPress = onLoginPress || go('/login')
  const handleRegisterPress = onRegisterPress || go('/register')

  const handleProfilePress = () => {
    if (typeof window === 'undefined') return
    // Lấy userId từ token thay vì localStorage
    const userId = getCurrentUserId()
    const targetId = userId && userId.length > 0 ? userId : 'me'
    router.push(`/users/${targetId}`)
  }

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    if (typeof window !== 'undefined') {
      // Sử dụng clearAuthToken để xóa token đã mã hóa
      clearAuthToken()
      window.localStorage?.removeItem('userId')
      window.dispatchEvent(new Event('token-changed'))
    }
    setShowLogoutConfirm(false)
    router.push('/login')
  }

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const stickyPositionStyle =
    position === 'relative'
      ? {
          position: 'relative',
          width: '100%',
        }
      : Platform.OS === 'web'
      ? {
          position: position || 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }
      : {
          position: position || 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }

  const interactiveAnimationStyle =
    Platform.OS === 'web'
      ? {
          transitionProperty: 'transform, opacity',
          transitionDuration: '180ms',
          transitionTimingFunction: 'ease-out',
        }
      : {}

  // Tự động thêm spacer khi navbar là fixed để tránh đè nội dung
  const needsSpacer = position === 'fixed' || (position === undefined && Platform.OS === 'web')
  const navbarHeight = 90 // Chiều cao ước tính của navbar

  return (
    <>
      <View
        style={[
          {
            width: '100%',
            paddingHorizontal: 16,
            paddingVertical: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFF8E7',
            overflow: 'hidden',
          },
          stickyPositionStyle,
          style,
        ]}
      >
      {/* Background image with 50% opacity */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          opacity: 0.2,
        }}
      />
      
      {/* Left section: Logo */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          zIndex: 1,
        }}
      >
        <Image
          source={normalizeImageSource(LogoImage)}
          style={{
            width: 120,
            height: 40,
            resizeMode: 'contain',
            transform: [{ scale: 2 }, { translateX: 30 }],
          }}
        />
      </View>

      {/* Small foot decoration in top right corner */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={{
          position: 'absolute',
          top: -5,
          right: 100,
          width: 200,
          height: 150,
          resizeMode: 'contain',
          opacity: 0.5,
          transform: [{ rotate: '-10deg' }],
        }}
      />

      {/* Center section: Navigation items */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 72,
          zIndex: 1,
        }}
      >
        {[
          {
            key: 'home',
            icon: homeIcon || HomeIcon,
            onPress: handleHomePress,
            hover: homeHover,
            setHover: setHomeHover,
            size: 40,
            tint: colors.DarkGreen,
          },
          {
            key: 'roadmap',
            icon: roadmapIcon || RoadmapIcon,
            onPress: handleRoadmapPress,
            hover: roadmapHover,
            setHover: setRoadmapHover,
            size: 40,
            tint: colors.primaryLight,
          },
          {
            key: 'roadmap-info',
            icon: RoadmapImage,
            onPress: handleRoadmapInfoPress,
            hover: roadmapInfoHover,
            setHover: setRoadmapInfoHover,
            size: 40,
          },
          {
            key: 'flashcard',
            icon: flashcardIcon || FlashcardIcon,
            onPress: handleFlashcardPress,
            hover: flashcardHover,
            setHover: setFlashcardHover,
            size: 40,
            tint: colors.Pink,
          },
          {
            key: 'blog',
            icon: blogIcon || BlogIcon,
            onPress: handleBlogPress,
            hover: blogHover,
            setHover: setBlogHover,
            size: 40,
            tint: colors.Mustard,
          },
        ].map((item) => (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            onHoverIn={() => Platform.OS === 'web' && item.setHover(true)}
            onHoverOut={() => Platform.OS === 'web' && item.setHover(false)}
            style={({ pressed }) => {
              const active = pressed || item.hover
              return {
                alignItems: 'center',
                opacity: active ? 0.85 : 1,
                transform: [{ translateY: active ? -3 : 0 }],
                ...interactiveAnimationStyle,
              }
            }}
          >
            <Image
              source={normalizeImageSource(item.icon)}
              style={{
                width: item.size,
                height: item.size,
                resizeMode: 'contain',
                tintColor: item.tint,
              }}
            />
          </Pressable>
        ))}
      </View>

      {/* Right section: Login and Register buttons */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          zIndex: 1,
        }}
      >
        {hasToken ? (
          <>
            <Pressable
              onPress={handleLogoutPress}
              onHoverIn={() => Platform.OS === 'web' && setLogoutHover(true)}
              onHoverOut={() => Platform.OS === 'web' && setLogoutHover(false)}
              style={({ pressed }) => {
                const active = pressed || logoutHover
                return {
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: active ? 0.85 : 1,
                  transform: [{ scale: active ? 0.95 : 1 }],
                  ...interactiveAnimationStyle,
                }
              }}
            >
              <Image
                source={normalizeImageSource(LogoutIcon)}
                style={{
                  width: 30,
                  height: 30,
                  resizeMode: 'contain',
                  tintColor: '#d9534f',
                }}
              />
            </Pressable>
            <Pressable
              onPress={handleProfilePress}
              onHoverIn={() => Platform.OS === 'web' && setUserHover(true)}
              onHoverOut={() => Platform.OS === 'web' && setUserHover(false)}
              style={({ pressed }) => {
                const active = pressed || userHover
                return {
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: active ? 0.85 : 1,
                  transform: [{ scale: active ? 0.95 : 1 }],
                  ...interactiveAnimationStyle,
                }
              }}
            >
              <Image
                source={normalizeImageSource(UserIcon)}
                style={{
                  width: 50,
                  height: 50,
                  resizeMode: 'contain',
                }}
              />
            </Pressable>
          </>
        ) : (
          <>
            {/* Đăng Nhập button */}
            <TouchableOpacity
              onPress={handleLoginPress}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: '#8B9A6B',
                borderWidth: 2,
                borderColor: '#4A90E2',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 120,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                Đăng Nhập
              </Text>
            </TouchableOpacity>

          </>
        )}
      </View>
      </View>
      {/* Spacer để tránh navbar fixed đè lên nội dung */}
      {needsSpacer && (
        <View
          style={{
            height: navbarHeight,
            width: '100%',
          }}
        />
      )}
      {showLogoutConfirm && (
        <View
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 2000,
          }}
          pointerEvents="box-none"
        >
          <MessageModal
            title="Xác nhận đăng xuất"
            message="Bạn có chắc chắn muốn đăng xuất khỏi Tokki?"
            buttonText="Đăng xuất"
            onButtonPress={handleConfirmLogout}
            onClose={handleCancelLogout}
          />
        </View>
      )}
    </>
  )
}

