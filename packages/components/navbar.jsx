import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native'
import { colors } from '../app/color'
import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo-text.png'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import StudyIcon from '../assets/icon/navigate-app/book.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import LeaderboardIcon from '../assets/icon/navigate-app/rank.svg'
import SmallFoot from '../assets/smallfoot.png'
import RoadmapIcon from '../assets/icon/navigate-app/roadmap.svg'
import DictionaryIcon from '../assets/icon/navigate-app/dictionary.svg'
import { useRouter } from 'solito/navigation'
import UserIcon from '../assets/user.png'
import LogoutIcon from '../assets/icon/icon-mainflow/logout.svg'
import { MessageModal } from './MessageModal'
import { getAuthToken, clearAuthToken, getCurrentUserId } from '../app/provider/api/client'

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

const RenderIcon = ({ icon, size, tint }) => {
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !icon.uri && !icon.src)) {
    const SvgIcon = icon;
    
    if (Platform.OS === 'web') {
      const colorId = tint ? tint.replace('#', '') : 'default';
      return (
        <div className={`nav-icon-tint-${colorId}`} style={{ width: size, height: size, display: 'flex' }}>
          <style>
            {`.nav-icon-tint-${colorId} svg path, 
              .nav-icon-tint-${colorId} svg rect, 
              .nav-icon-tint-${colorId} svg circle { 
                fill: ${tint} !important; 
            }`}
          </style>
          <SvgIcon width="100%" height="100%" />
        </div>
      )
    }
    
    return <SvgIcon width={size} height={size} fill={tint} color={tint} />
  }
  
  return (
    <Image
      source={normalizeImageSource(icon)}
      style={{
        width: size,
        height: size,
        resizeMode: 'contain',
        tintColor: tint,
      }}
    />
  )
}

export const Navbar = ({
  homeIcon,
  roadmapIcon,
  flashcardIcon,
  blogIcon,
  dictionaryIcon,
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
  const [dictionaryHover, setDictionaryHover] = useState(false)
  const [leaderboardHover, setLeaderboardHover] = useState(false)
  const [userHover, setUserHover] = useState(false)
  const [logoutHover, setLogoutHover] = useState(false)
  const [roadmapInfoHover, setRoadmapInfoHover] = useState(false)
  const [premiumHover, setPremiumHover] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return
    if (typeof window.addEventListener !== 'function') return
    
    const checkToken = () => {
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
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener('token-changed', onTokenChanged)
      }
    }
  }, [])

  useEffect(() => {
    if (!router?.prefetch) return
    const routesToPrefetch = ['/homepage', '/study', '/flashcard', '/blog', '/roadmap/info', '/leaderboard', '/login', '/register', '/payment-package']
    routesToPrefetch.forEach((r) => {
      router.prefetch(r).catch(() => {})
    })
  }, [router])

  const go = useCallback((path, fallback) => {
    if (path) return () => router.push(path)
    return fallback
  }, [router])

  const handleHomePress = onHomePress || go('/homepage')
  const handleRoadmapPress = onRoadmapPress || go('/study')
  const handleRoadmapInfoPress = go('/roadmap/info')
  const handleFlashcardPress = onFlashcardPress || go('/flashcard')
  const handleBlogPress = onBlogPress || go('/blog')
  const handleDictionaryPress = go('/dictionary')
  const handleLeaderboardPress = go('/leaderboard')
  const handleLoginPress = onLoginPress || go('/login')
  const handleRegisterPress = onRegisterPress || go('/register')

  const handleProfilePress = () => {
    if (typeof window === 'undefined') return
    const userId = getCurrentUserId()
    const targetId = userId && userId.length > 0 ? userId : 'me'
    router.push(`/users/${targetId}`)
  }

  const handlePremiumPress = () => {
    router.push('/payment-package')
  }

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    if (typeof window !== 'undefined') {
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
      ? { position: 'relative', width: '100%' }
      : Platform.OS === 'web'
      ? { position: position || 'fixed', top: 0, left: 0, right: 0, zIndex: 999 }
      : { position: position || 'absolute', top: 0, left: 0, right: 0, zIndex: 999 }

  const interactiveAnimationStyle =
    Platform.OS === 'web'
      ? {
          transitionProperty: 'transform, opacity',
          transitionDuration: '180ms',
          transitionTimingFunction: 'ease-out',
        }
      : {}

  const needsSpacer = position === 'fixed' || (position === undefined && Platform.OS === 'web')
  const navbarHeight = 60 

  // Danh sách các Menu có kèm theo Label để hiện Tooltip
  const navItems = [
    {
      key: 'home',
      label: 'Trang chủ',
      icon: homeIcon || HomeIcon,
      onPress: handleHomePress,
      hover: homeHover,
      setHover: setHomeHover,
      size: 40,
      tint: colors.DarkGreen,
    },
    {
      key: 'roadmap',
      label: 'Menu',
      icon: roadmapIcon || StudyIcon,
      onPress: handleRoadmapPress,
      hover: roadmapHover,
      setHover: setRoadmapHover,
      size: 40,
      tint: colors.accentPink,
    },
    {
      key: 'roadmap-info',
      label: 'Thông tin lộ trình',
      icon: RoadmapIcon,
      onPress: handleRoadmapInfoPress,
      hover: roadmapInfoHover,
      setHover: setRoadmapInfoHover,
      size: 40,
      tint: colors.Mustard,
    },
    {
      key: 'flashcard',
      label: 'Từ vựng',
      icon: flashcardIcon || FlashcardIcon,
      onPress: handleFlashcardPress,
      hover: flashcardHover,
      setHover: setFlashcardHover,
      size: 40,
      tint: colors.background,
    },
    {
      key: 'dictionary',
      label: 'Từ điển',
      icon: dictionaryIcon || DictionaryIcon,
      onPress: handleDictionaryPress,
      hover: dictionaryHover,
      setHover: setDictionaryHover,
      size: 40,
      tint: colors.neutralBlack,
    },
    {
      key: 'blog',
      label: 'Blog',
      icon: blogIcon || BlogIcon,
      onPress: handleBlogPress,
      hover: blogHover,
      setHover: setBlogHover,
      size: 40,
      tint: colors.DarkPink,
    },
    {
      key: 'leaderboard',
      label: 'Bảng xếp hạng',
      icon: LeaderboardIcon,
      onPress: handleLeaderboardPress,
      hover: leaderboardHover,
      setHover: setLeaderboardHover,
      size: 40,
      tint: colors.LightGreen,
    },
  ];

  return (
    <>
      <View
        style={[
          {
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFF8E7',
            overflow: 'visible', // Sửa overflow thành visible để Tooltip rớt ra ngoài viền được
            height: '8%',
            minHeight: 60,
          },
          stickyPositionStyle,
          style,
        ]}
      >
        {/* Background image */}
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
        <View style={{ position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 1 }}>
          <Image
            source={normalizeImageSource(LogoImage)}
            style={{ width: 120, height: 40, resizeMode: 'contain', transform: [{ scale: 2 }, { translateX: 30 }] }}
          />
        </View>

        {/* Small foot decoration */}
        <Image
          source={normalizeImageSource(SmallFoot)}
          style={{ position: 'absolute', top: -5, right: 100, width: 200, height: 150, resizeMode: 'contain', opacity: 0.5, transform: [{ rotate: '-10deg' }] }}
        />

        {/* Center section: Navigation items */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 72, zIndex: 10 }}>
          {navItems.map((item) => (
            <View key={item.key} style={{ alignItems: 'center', position: 'relative' }}>
              <Pressable
                onPress={item.onPress}
                onHoverIn={() => Platform.OS === 'web' && item.setHover(true)}
                onHoverOut={() => Platform.OS === 'web' && item.setHover(false)}
                style={({ pressed }) => {
                  const active = pressed || item.hover
                  return {
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: active ? 0.85 : 1,
                    transform: [{ translateY: active ? -3 : 0 }],
                    ...interactiveAnimationStyle,
                  }
                }}
              >
                {/* Dùng hàm RenderIcon mới thay cho Image */}
                <RenderIcon icon={item.icon} size={item.size} tint={item.tint} />
              </Pressable>

              {/* Tooltip (Chú thích) sẽ hiện ra khi di chuột vào (hover === true) */}
              {item.hover && Platform.OS === 'web' && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{item.label}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Right section: Login and Register buttons */}
        <View style={{ position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 1 }}>
          {hasToken ? (
            <>
              {/* Premium Upgrade Button */}
              <Pressable
                onPress={handlePremiumPress}
                onHoverIn={() => Platform.OS === 'web' && setPremiumHover(true)}
                onHoverOut={() => Platform.OS === 'web' && setPremiumHover(false)}
                style={({ pressed }) => {
                  const active = pressed || premiumHover
                  return {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: active ? '#FFD700' : '#FFC107',
                    borderWidth: 2,
                    borderColor: '#FFA000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 6,
                    shadowColor: '#FFD700',
                    shadowOpacity: active ? 0.5 : 0.3,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                    transform: [{ scale: active ? 0.95 : 1 }],
                    ...interactiveAnimationStyle,
                  }
                }}
              >
                <Text style={{ fontSize: 18 }}>⭐</Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: 'bold',
                    color: '#8B4513',
                    fontFamily: 'Epilogue, sans-serif',
                    textShadowColor: 'rgba(255, 255, 255, 0.5)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Premium
                </Text>
              </Pressable>
              
              <View style={{ position: 'relative', alignItems: 'center' }}>
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
                  <RenderIcon icon={LogoutIcon} size={30} tint="#d9534f" />
                </Pressable>
                {logoutHover && Platform.OS === 'web' && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>Đăng xuất</Text>
                  </View>
                )}
              </View>

              <View style={{ position: 'relative', alignItems: 'center' }}>
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
                  <Image source={normalizeImageSource(UserIcon)} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
                </Pressable>
                {userHover && Platform.OS === 'web' && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>Hồ sơ</Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
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
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', fontFamily: 'Epilogue, sans-serif' }}>
                  Đăng Nhập
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {needsSpacer && <View style={{ height: navbarHeight, width: '100%' }} />}
      
      {showLogoutConfirm && (
        <View
          style={{
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
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

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    top: 55, // Nằm ngay dưới icon
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 9999,
    // Web only properties
    ...(Platform.OS === 'web' && {
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    })
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  }
})