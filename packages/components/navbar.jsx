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
import { MessageModal } from './MessageModal'

import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo-text.png'
import LogoIcon from '../assets/logo.png'
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
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  // Xác định xem item có đang ở trang hiện tại hay không
  const isOnPage = pathname === path || (path !== '/' && path !== '/homepage' && pathname?.startsWith(path))

  const activeColor = tint || '#78905E'
  const isWeb = Platform.OS === 'web'
  const isHighlighted = (isHovered && isWeb) || isOnPage

  return (
    <View style={styles.navItemContainer}>
      <Pressable
        onPress={() => router.push(path)}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => {
          const isPressed = pressed
          return [
            styles.navIconWrap,
            compact && styles.navIconWrapCompact,
            isHighlighted && { 
               backgroundColor: activeColor + '15', // ~8% opacity
               transform: [{ scale: 1.05 }]
            },
            isPressed && { transform: [{ scale: 0.95 }] },
          ]
        }}
      >
        <IconRenderer 
          icon={icon} 
          size={compact ? 24 : 32} 
          tint={isHighlighted ? activeColor : '#6A5634'} 
        />
        {isOnPage && !compact && <View style={[styles.activeIndicator, { backgroundColor: activeColor }]} />}
      </Pressable>

      {!compact ? (
        <Text
          style={[
            styles.navLabel,
            isHighlighted && { color: activeColor, fontWeight: '700' },
          ]}
        >
          {label}
        </Text>
      ) : null}

      {compact && isHovered && isWeb && (
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
  const [isPremiumHovered, setIsPremiumHovered] = useState(false)
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

  return (
    <>
      <View style={[styles.headerBase, stickyPositionStyle]}>
        <Image source={BackgroundImage} style={styles.bgImage} resizeMode="cover" />

        <View style={[styles.headerInner, isMobile && styles.headerInnerMobile]}>
          <TouchableOpacity style={styles.logoButton} onPress={() => router.push('/homepage')}>
            <Image
              source={LogoImage}
              style={[styles.logoIcon, isMobile && styles.logoIconMobile]}
              resizeMode="contain"
            />
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
                    <Pressable
                      onPress={() => router.push('/payment-package')}
                      onHoverIn={() => setIsPremiumHovered(true)}
                      onHoverOut={() => setIsPremiumHovered(false)}
                      style={({ pressed }) => [
                        styles.premiumBtn,
                        pressed && styles.premiumBtnPressed,
                        isPremiumHovered && Platform.OS === 'web' && styles.premiumBtnHovered
                      ]}
                    >
                      {Platform.OS === 'web' && (
                        <style dangerouslySetInnerHTML={{
                          __html: `
                          @keyframes premium-shine {
                            0% { left: -150%; opacity: 0; }
                            20% { opacity: 0.8; }
                            50% { left: 150%; opacity: 0; }
                            100% { left: 150%; opacity: 0; }
                          }
                          .premium-shine-element {
                            position: absolute !important;
                            top: 0;
                            width: 60px;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent) !important;
                            transform: skewX(-25deg);
                            animation: premium-shine 2s infinite ease-in-out;
                            pointer-events: none;
                            z-index: 1;
                          }
                        ` }} />
                      )}
                      {Platform.OS === 'web' && isPremiumHovered && (
                        <View
                          style={styles.shineInner}
                          //@ts-ignore
                          dataSet={{ className: 'premium-shine-element' }}
                        />
                      )}
                      <IconRenderer icon={StarIcon} size={18} tint="#FFC107" />
                      <Text style={styles.premiumText}>Premium</Text>
                    </Pressable>
                  </View>

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
                <TouchableOpacity
                  style={styles.mobileMenuItemInline}
                  onPress={() => {
                    router.push('/payment-package')
                    setMobileMenuOpen(false)
                  }}
                >
                  <IconRenderer icon={StarIcon} size={16} tint="#FFC107" />
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
    backgroundColor: 'rgba(255, 248, 231, 0.75)',
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 232, 210, 0.5)',
    ...(Platform.OS === 'web'
      ? {
        boxShadow: '0 4px 10px rgba(141, 122, 75, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 10,
  },
  logoIcon: {
    width: 120,
    height: 48,
  },
  logoIconMobile: {
    width: 80,
    height: 36,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -2,
    ...(Platform.OS === 'web' && {
      textShadow: '0 2px 4px rgba(212, 162, 50, 0.12)',
    }),
  },
  logoTextMobile: {
    fontSize: 22,
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
    width: 80,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      transition: 'all 240ms ease-out',
    }),
  },
  navIconWrapActive: {
    opacity: 1,
  },
  navIconWrapCompact: {
    width: 34,
    height: 30,
  },
  navLabel: {
    fontSize: 11,
    color: '#6A5634',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'color 180ms ease-out',
    }),
  },
  navLabelActive: {
    color: '#2A1F0D',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(233, 223, 195, 0.6)',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, opacity, background-color, box-shadow',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    }),
  },
  iconActionPressed: {
    opacity: 1,
    transform: [{ scale: 0.95 }],
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    }),
  },
  premiumWrapper: {
    padding: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumBtn: {
    height: 42,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3CD6A',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, opacity, backgroundColor, boxShadow, borderColor',
      transitionDuration: '240ms',
      transitionTimingFunction: 'ease-out',
      boxShadow: '0 4px 15px rgba(243, 205, 106, 0.2)',
    }),
  },
  premiumBtnHovered: {
    backgroundColor: '#FFE9A8',
    borderColor: '#E6B942',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 6px 20px rgba(243, 205, 106, 0.4)',
    }),
  },
  premiumBtnPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: '#FFD54F',
  },
  shineInner: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web' && {
      className: 'premium-shine',
    }),
  },
  premiumText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8A6200',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: 0.3,
    zIndex: 2,
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
    marginVertical: 2,
  },
  mobileMenuItemActive: {
    backgroundColor: '#F5F5F5',
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
