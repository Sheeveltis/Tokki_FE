import { useEffect, useMemo, useState } from 'react'
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
import { useRouter } from 'solito/navigation'
import { colors } from '../app/color'
import { getAuthToken, clearAuthToken, getCurrentUserId } from '../app/provider/api/client'
import { MessageModal } from './MessageModal'

import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo-text.png'
import HomeIcon from '../assets/icon/navigate-app/home.svg'
import StudyIcon from '../assets/icon/navigate-app/book.svg'
import FlashcardIcon from '../assets/icon/navigate-app/folder.svg'
import BlogIcon from '../assets/icon/navigate-app/chat.svg'
import LeaderboardIcon from '../assets/icon/navigate-app/rank.svg'
import RoadmapIcon from '../assets/icon/navigate-app/roadmap.svg'
import DictionaryIcon from '../assets/icon/navigate-app/dictionary.svg'
import UserIcon from '../assets/user.png'
import LogoutIcon from '../assets/icon/icon-mainflow/logout.svg'

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
        style={{ color: tint }}
      />
    )
  }

  return <Image source={icon} style={{ width: size, height: size, tintColor: tint }} resizeMode="contain" />
}

const NavItem = ({ icon, label, tint, path, compact = false }) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <View style={styles.navItemContainer}>
      <Pressable
        onPress={() => router.push(path)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => {
          const active = pressed || (isHovered && Platform.OS === 'web')
          return [
            styles.navIconWrap,
            active && styles.navIconWrapActive,
            compact && styles.navIconWrapCompact,
          ]
        }}
      >
        <IconRenderer icon={icon} size={compact ? 24 : 34} tint={tint} />
      </Pressable>

      {!compact ? <Text style={styles.navLabel}>{label}</Text> : null}

      {compact && isHovered && Platform.OS === 'web' && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{label}</Text>
        </View>
      )}
    </View>
  )
}

export const Navbar = ({ position = 'fixed' }) => {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const isMobile = width < 920

  const [hasToken, setHasToken] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  return (
    <>
      <View style={[styles.headerBase, stickyPositionStyle]}>
        <Image source={BackgroundImage} style={styles.bgImage} resizeMode="cover" />

        <View style={[styles.headerInner, isMobile && styles.headerInnerMobile]}>
          <TouchableOpacity style={styles.logoButton} onPress={() => router.push('/homepage')}>
            <Image source={LogoImage} style={[styles.logo, isMobile && styles.logoMobile]} resizeMode="contain" />
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
                  {!isMobile ? (
                    <Pressable
                      onPress={() => router.push('/payment-package')}
                      style={({ pressed }) => [styles.premiumBtn, pressed && styles.premiumBtnPressed]}
                    >
                      <Text style={styles.premiumEmoji}>★</Text>
                      <Text style={styles.premiumText}>Premium</Text>
                    </Pressable>
                  ) : null}

                  {!isMobile ? (
                    <Pressable
                      onPress={() => setShowLogoutConfirm(true)}
                      style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                    >
                      <IconRenderer icon={LogoutIcon} size={26} tint="#D45A54" />
                    </Pressable>
                  ) : null}

                  <Pressable
                    onPress={() => router.push(`/users/${getCurrentUserId() || 'me'}`)}
                    style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                  >
                    <Image source={UserIcon} style={[styles.avatar, isMobile && styles.avatarMobile]} resizeMode="contain" />
                  </Pressable>
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
            {navMenu.map((item) => (
              <TouchableOpacity
                key={item.path}
                style={styles.mobileMenuItem}
                onPress={() => {
                  router.push(item.path)
                  setMobileMenuOpen(false)
                }}
              >
                <NavItem {...item} compact />
              </TouchableOpacity>
            ))}

            {authChecked && hasToken ? (
              <>
                <View style={styles.mobileSeparator} />
                <TouchableOpacity
                  style={styles.mobileMenuItemInline}
                  onPress={() => {
                    router.push('/payment-package')
                    setMobileMenuOpen(false)
                  }}
                >
                  <Text style={styles.premiumEmoji}>★</Text>
                  <Text style={[styles.mobileMenuText, styles.mobilePremiumText]}>Premium</Text>
                </TouchableOpacity>

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
    backgroundColor: '#FFF8E7',
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8D2',
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 4px 10px rgba(141, 122, 75, 0.08)' } 
      : {
          shadowColor: '#8D7A4B',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }),
    elevation: 3,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.18,
  },
  headerInner: {
    height: '100%',
    width: '100%',
    maxWidth: 1400,
    alignSelf: 'center',
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerInnerMobile: {
    width: '94%',
    maxWidth: '100%',
    gap: 10,
  },
  logoButton: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
  },
  logo: {
    width: 124,
    height: 200,
  },
  logoMobile: {
    width: 100,
    height: 36,
  },
  navWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 54,
    gap: 8,
  },
  navIconWrap: {
    width: 100,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, opacity, background-color',
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  navIconWrapActive: {
    opacity: 0.9,
    transform: [{ translateY: -2 }],
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  navIconWrapCompact: {
    width: 34,
    height: 30,
  },
  navLabel: {
    fontSize: 11,
    color: '#5A4A32',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: '#E9DFC3',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, opacity, background-color',
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  iconActionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  premiumBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3CD6A',
    backgroundColor: '#FFE9A8',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, opacity, background-color',
      transitionDuration: '180ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  premiumBtnPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#FFE195',
  },
  premiumEmoji: {
    fontSize: 14,
    color: '#9A6D00',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7A5200',
    fontFamily: 'Epilogue, sans-serif',
  },
  avatar: {
    width: 30,
    height: 30,
  },
  avatarMobile: {
    width: 26,
    height: 26,
  },
  loginBtn: {
    height: 38,
    borderRadius: 12,
    backgroundColor: '#78905E',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#68824E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnMobile: {
    height: 34,
    paddingHorizontal: 12,
  },
  loginText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  loginTextMobile: {
    fontSize: 12,
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.64)',
    borderWidth: 1,
    borderColor: '#E8DDC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6A5634',
    lineHeight: 22,
  },
  mobileDropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT - 2,
    right: '3%',
    width: 250,
    backgroundColor: '#FFFDF6',
    borderRadius: 14,
    padding: 10,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 6px 14px rgba(79, 59, 29, 0.15)' }
      : {
          shadowColor: '#4F3B1D',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 14,
        }),
    elevation: 8,
    zIndex: 1500,
    borderWidth: 1,
    borderColor: '#EFE4C8',
  },
  mobileMenuItem: {
    borderRadius: 10,
  },
  mobileMenuItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
    borderRadius: 10,
  },
  mobileMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#493B27',
    fontFamily: 'Epilogue, sans-serif',
  },
  mobilePremiumText: {
    color: '#8B5A00',
  },
  mobileLogoutText: {
    color: '#C14E48',
  },
  mobileSeparator: {
    height: 1,
    backgroundColor: '#EFE4C8',
    marginVertical: 8,
  },
  tooltip: {
    position: 'absolute',
    top: 38,
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 9999,
    ...(Platform.OS === 'web' && { whiteSpace: 'nowrap', pointerEvents: 'none' }),
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  modalOverlay: {
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
  },
})
