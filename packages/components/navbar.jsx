import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'solito/navigation'
import {
  View,
  Image,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import { colors } from '../app/color'
import { getAuthToken, clearAuthToken, getCurrentUserId } from '../app/provider/api/client'
import { useNotifications } from '../app/provider/notification'
import { MessageModal } from './MessageModal'

import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo-text.png'
import LogoIcon from '../assets/logo.png'
import LogoNewIcon from '../assets/homepage/Logo.png'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import StudyIcon from '../assets/icon/navigate-app/book.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import LeaderboardIcon from '../assets/icon/navigate-app/rank.svg'
import RoadmapIcon from '../assets/icon/navigate-app/roadmap.svg'
import DictionaryIcon from '../assets/icon/navigate-app/dictionary.svg'
import UserIcon from '../assets/user.png'
import LogoutIcon from '../assets/icon/icon-mainflow/logout.svg'
import StarIcon from '../assets/icon/icon-mainflow/star.svg'
import { BellOutlined, UserOutlined, LogoutOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Dropdown, Menu } from 'antd'
import PremiumButton from './PremiumButton'

const HEADER_HEIGHT = 72

const IconRenderer = ({ icon, size = 24, tint }) => {
  if (!icon) return null

  const Comp = typeof icon === 'function' ? icon : icon?.default
  if (Comp) {
    return (
      <Comp
        width={size}
        height={size}
        fill={tint}
        color={tint}
        style={{ color: tint, fontSize: size }}
      />
    )

  }

  return <Image source={icon} style={{ width: size, height: size, tintColor: tint }} resizeMode="contain" />
}

const NavItem = ({ icon, label, tint, path, compact = false }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  const isOnPage = pathname === path || (path !== '/' && path !== '/homepage' && pathname?.startsWith(path))
  const isWeb = Platform.OS === 'web'
  const isHighlighted = (isHovered && isWeb) || isOnPage

  return (
    <View style={styles.navItemContainer}>
      <Pressable
        onPress={() => router.push(path)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => {
          return [
            styles.navIconWrap,
            compact && styles.navIconWrapCompact,
            isHighlighted && isWeb && styles.navIconWrapHoverWeb,
            isOnPage && isWeb && styles.navIconWrapActiveWeb,
            pressed && { transform: [{ scale: 0.95 }] },
          ]
        }}
      >
        <IconRenderer 
          icon={icon} 
          size={isWeb && !compact ? 24 : 28} 
          tint={isOnPage ? '#FFB300' : isHighlighted ? '#5D4037' : '#8D6E63'} 
        />
        {isWeb && !compact && (
          <Text
            style={[
              styles.navLabel,
              isOnPage && { color: '#FFB300', fontWeight: '800' },
              isHighlighted && !isOnPage && { color: '#5D4037' }
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>

      {!isWeb && !compact ? (
        <Text style={[styles.navLabel, isOnPage && { color: tint || '#FFB300', fontWeight: '700' }]}>
          {label}
        </Text>
      ) : null}
    </View>
  )
}

export const Navbar = ({ position = 'fixed' }) => {
  const router = useRouter()
  const { unreadCount } = useNotifications()
  const { width } = useWindowDimensions()
  const isMobile = width < 920

  const [hasToken, setHasToken] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => {
      setHasToken(!!getAuthToken())
      setAuthChecked(true)
    }
    check()

    if (Platform.OS !== 'web') return

    window.addEventListener('token-changed', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('token-changed', check)
      window.removeEventListener('storage', check)
    }
  }, [])

  const navMenu = useMemo(
    () => [
      { label: 'Trang chủ', icon: HomeIcon, path: '/homepage', tint: colors.DarkGreen },
      { label: 'Học tập', icon: StudyIcon, path: '/study', tint: colors.accentPink },
      { label: 'Lộ trình', icon: RoadmapIcon, path: '/roadmap', tint: colors.Mustard },
      { label: 'Từ vựng', icon: FlashcardIcon, path: '/flashcard', tint: colors.background },
      { label: 'Từ điển', icon: DictionaryIcon, path: '/dictionary', tint: colors.neutralBlack },
      { label: 'Blog', icon: BlogIcon, path: '/blog', tint: colors.DarkPink },
      { label: 'Xếp hạng', icon: LeaderboardIcon, path: '/leaderboard', tint: colors.LightGreen },
    ],
    []
  )

  const stickyPositionStyle =
    position === 'relative'
      ? { position: 'relative', width: '100%' }
      : Platform.OS === 'web'
        ? { position: position || 'fixed', top: 0, left: 0, right: 0, zIndex: 999 }
        : { position: position || 'absolute', top: 0, left: 0, right: 0, zIndex: 999 }

  const handleLogout = () => {
    clearAuthToken()
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('token-changed'))
    }
    router.push('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      icon: <InfoCircleOutlined />,
      onClick: () => router.push(`/users/${getCurrentUserId() || 'me'}`)
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      danger: true,
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ]

  return (
    <>
      <View style={[styles.headerBase, stickyPositionStyle]}>
        <Image source={BackgroundImage} style={styles.bgImage} resizeMode="cover" />

        <View style={[styles.headerInner, isMobile && styles.headerInnerMobile]}>
          <TouchableOpacity 
            style={styles.logoButton} 
            onPress={() => router.push('/homepage')}
            activeOpacity={0.7}
          >
            <View style={[styles.logoIconContainer, isMobile && styles.logoIconMobile]}>
              <Image 
                source={LogoNewIcon} 
                style={styles.logoIconImage} 
                resizeMode="contain" 
              />
            </View>
            <Text style={[styles.logoText, isMobile && styles.logoTextMobile]}>Tokki</Text>
          </TouchableOpacity>

          {!isMobile ? (
            <View style={styles.navWrapper}>
              {navMenu.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </View>
          ) : null}

          <View style={styles.rightSection}>
            {authChecked ? (
              hasToken ? (
                <>
                  <View style={styles.premiumWrapper}>
                    <PremiumButton
                      onPress={() => router.push('/payment-package')}
                    />
                  </View>

                  <Pressable
                    onPress={() => router.push('/notifications')}
                    style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                  >
                    <BellOutlined style={{ fontSize: 22, color: '#8D6E63' }} />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                      </View>
                    )}
                  </Pressable>

                  {Platform.OS === 'web' ? (
                    <Dropdown
                      menu={{ items: userMenuItems }}
                      placement="bottomRight"
                      trigger={['hover']}
                      overlayStyle={{ paddingTop: 10 }}
                    >
                      <Pressable style={({ pressed }) => [styles.userIconBtn, pressed && styles.iconActionPressed]}>
                        <UserOutlined style={{ fontSize: 20, color: '#FFFFFF' }} />
                      </Pressable>
                    </Dropdown>
                  ) : (
                    <Pressable
                      onPress={() => router.push(`/users/${getCurrentUserId() || 'me'}`)}
                      style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                    >
                      <Image 
                        source={UserIcon} 
                        style={[styles.avatar, isMobile && styles.avatarMobile]} 
                        resizeMode="cover" 
                      />
                    </Pressable>
                  )}
                </>
              ) : (
                <TouchableOpacity onPress={() => router.push('/login')} style={[styles.loginBtn, isMobile && styles.loginBtnMobile]}>
                  <Text style={[styles.loginText, isMobile && styles.loginTextMobile]}>Đăng nhập</Text>
                </TouchableOpacity>
              )
            ) : null}

            {isMobile ? (
              <TouchableOpacity onPress={() => setMobileMenuOpen((prev) => !prev)} style={styles.hamburgerBtn}>
                <Text style={styles.hamburgerText}>☰</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {isMobile && mobileMenuOpen ? (
          <View style={styles.mobileDropdown}>
            {navMenu.map((item) => {
              const isOnPage = pathname === item.path || (item.path !== '/' && item.path !== '/homepage' && pathname?.startsWith(item.path))
              const activeColor = item.tint || '#78905E'
              
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[
                    styles.mobileMenuItem, 
                    isOnPage && { backgroundColor: activeColor + '10', borderLeftColor: activeColor, borderLeftWidth: 4 }
                  ]}
                  onPress={() => {
                    router.push(item.path)
                    setMobileMenuOpen(false)
                  }}
                >
                  <NavItem {...item} compact />
                </TouchableOpacity>
              )
            })}

            {authChecked && hasToken ? (
              <>
                <View style={styles.mobileSeparator} />
                <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                  <PremiumButton
                    onPress={() => {
                      router.push('/payment-package')
                      setMobileMenuOpen(false)
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.mobileMenuItemInline}
                  onPress={() => {
                    setMobileMenuOpen(false)
                    setShowLogoutConfirm(true)
                  }}
                >
                  <IconRenderer icon={LogoutIcon} size={20} tint="#D45A54" />
                  <Text style={[styles.mobileMenuText, styles.mobileLogoutText]}>Đăng xuất</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      {(position === 'fixed' || (position === undefined && Platform.OS === 'web')) && <View style={{ height: HEADER_HEIGHT, width: '100%' }} />}

      {showLogoutConfirm ? (
        <View style={styles.modalOverlay} pointerEvents="box-none">
          <MessageModal
            title="Xác nhận đăng xuất"
            message="Bạn có chắc chắn muốn đăng xuất khỏi Tokki?"
            buttonText="Đăng xuất"
            onButtonPress={handleLogout}
            onClose={() => setShowLogoutConfirm(false)}
          />
        </View>
      ) : null}
    </>
  )
}

export const Header = Navbar

const styles = StyleSheet.create({
  headerBase: {
    width: '100%',
    height: HEADER_HEIGHT,
    backgroundColor: 'rgba(255, 251, 240, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#EEDCC5',
    ...(Platform.OS === 'web'
      ? {
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }
      : {
        shadowColor: '#5D4037',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }),
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.05,
  },
  headerInner: {
    height: '100%',
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerInnerMobile: {
    paddingHorizontal: 12,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconImage: {
    width: '100%',
    height: '100%',
  },
  logoIconMobile: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFB300',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    letterSpacing: -1,
  },
  logoTextMobile: {
    fontSize: 20,
  },
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flex: 1,
    justifyContent: 'center',
  },
  navItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrap: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s ease',
    }),
  },
  navIconWrapHoverWeb: {
    backgroundColor: 'rgba(242, 232, 207, 0.5)',
  },
  navIconWrapActiveWeb: {
    backgroundColor: '#F2E8CF',
  },
  navLabel: {
    fontSize: 10,
    color: '#8D6E63',
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  iconActionPressed: {
    backgroundColor: '#F2E8CF',
    opacity: 0.8
  },
  userIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEDCC5', 
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } 
      : { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2 }
    ),
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  premiumWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#EEDCC5',
    backgroundColor: '#EEDCC5',
  },
  avatarMobile: {
    width: 32,
    height: 32,
  },
  loginBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#5D4037',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnMobile: {
    height: 34,
    paddingHorizontal: 12,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginTextMobile: {
    fontSize: 12,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(93, 64, 55, 0.3)',
    backdropFilter: 'blur(4px)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
})
