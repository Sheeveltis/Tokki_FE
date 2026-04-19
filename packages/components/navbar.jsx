import React, { useEffect, useMemo, useState } from 'react'
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
  ScrollView,
} from 'react-native'
import { colors } from '../app/color'
import { getAuthToken, clearAuthToken, getCurrentUserId, getCurrentUserAvatar } from '../app/provider/api/client'
import { useNotifications, NotificationReadFilter } from '../app/provider/notification'
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
import { 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  InfoCircleOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  StarOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
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
  const { unreadCount, notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications()
  const { width } = useWindowDimensions()
  const isMobile = width < 920

  const [hasToken, setHasToken] = useState(null)
  const [userAvatar, setUserAvatar] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notiFilter, setNotiFilter] = useState(NotificationReadFilter.All)
  const pathname = usePathname()

  useEffect(() => {
    const check = () => {
      setHasToken(!!getAuthToken())
      setUserAvatar(getCurrentUserAvatar())
      setAuthChecked(true)
    }
    check()

    if (Platform.OS !== 'web') return

    window.addEventListener('token-changed', check)
    window.addEventListener('avatar-changed', check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener('token-changed', check)
      window.removeEventListener('avatar-changed', check)
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
      key: 'blog-management',
      label: 'Quản lý bài viết blog',
      icon: <FileTextOutlined />,
      onClick: () => router.push('/blog/management')
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

                  {Platform.OS === 'web' ? (
                    <Dropdown
                      popupRender={() => (
                        <View style={styles.notiDropdown}>
                          <View style={styles.notiHeader}>
                            <View>
                              <Text style={styles.notiTitle}>Thông báo</Text>
                              {unreadCount > 0 && (
                                <Text style={styles.notiSubtitle}>Bạn có {unreadCount} thông báo chưa đọc</Text>
                              )}
                            </View>
                            <TouchableOpacity onPress={markAllAsRead}>
                              <Text style={styles.notiReadAll}>Đọc tất cả</Text>
                            </TouchableOpacity>
                          </View>

                          <View style={styles.tabContainer}>
                            {[
                              { label: 'Tất cả', value: NotificationReadFilter.All },
                              { label: 'Chưa đọc', value: NotificationReadFilter.Unread },
                              { label: 'Đã đọc', value: NotificationReadFilter.Read }
                            ].map(tab => (
                              <TouchableOpacity 
                                key={tab.value}
                                onPress={() => {
                                  setNotiFilter(tab.value)
                                  fetchNotifications(tab.value)
                                }}
                                style={[styles.tabItem, notiFilter === tab.value && styles.tabItemActive]}
                              >
                                <Text style={[styles.tabLabel, notiFilter === tab.value && styles.tabLabelActive]}>
                                  {tab.label}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          
                          <ScrollView style={styles.notiList} showsVerticalScrollIndicator={true}>
                            {notifications.length > 0 ? (
                              notifications.map((noti) => {
                                const config = (() => {
                                  switch (noti.type) {
                                    case 1: return { icon: <CheckCircleOutlined />, color: '#52C41A', bg: '#F6FFED' }
                                    case 2: return { icon: <MessageOutlined />, color: '#1890FF', bg: '#E6F7FF' }
                                    case 3: return { icon: <FileTextOutlined />, color: '#722ED1', bg: '#F9F0FF' }
                                    case 4: return { icon: <StarOutlined />, color: '#FAAD14', bg: '#FFFBE6' }
                                    case 5: return { icon: <TrophyOutlined />, color: '#FF7A45', bg: '#FFF2E8' }
                                    case 6: return { icon: <ExclamationCircleOutlined />, color: '#FF4D4F', bg: '#FFF1F0' }
                                    default: return { icon: <InfoCircleOutlined />, color: '#8D6E63', bg: '#F5F5F5' }
                                  }
                                })()

                                return (
                                  <TouchableOpacity 
                                    key={noti.id} 
                                    onPress={() => {
                                      markAsRead(noti.id)
                                    }}
                                    style={[styles.notiItem, !noti.isRead && styles.notiItemUnread]}
                                  >
                                    <View style={[styles.notiIconWrap, { backgroundColor: config.bg }]}>
                                      {React.cloneElement(config.icon, { style: { fontSize: 18, color: config.color } })}
                                    </View>
                                    <View style={styles.notiItemContent}>
                                      <View style={styles.notiItemHeader}>
                                        <Text style={[styles.notiItemTitle, !noti.isRead && styles.notiItemTitleUnread]} numberOfLines={1}>
                                          {noti.title}
                                        </Text>
                                        {!noti.isRead && <View style={styles.unreadDot} />}
                                      </View>
                                      <Text style={styles.notiItemText} numberOfLines={3}>
                                        {noti.content}
                                      </Text>
                                      <View style={styles.notiItemFooter}>
                                        <ClockCircleOutlined style={{ fontSize: 10, color: '#BDBDBD', marginRight: 4 }} />
                                        <Text style={styles.notiItemTime}>
                                          {new Date(noti.createdAt).toLocaleString('vi-VN', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            day: '2-digit',
                                            month: '2-digit'
                                          })}
                                        </Text>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                )
                              })
                            ) : (
                              <View style={styles.emptyNoti}>
                                <View style={{ 
                                  width: 64, 
                                  height: 64, 
                                  borderRadius: 32, 
                                  backgroundColor: '#FAF9F6', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  marginBottom: 16
                                }}>
                                  <BellOutlined style={{ fontSize: 32, color: '#EEDCC5' }} />
                                </View>
                                <Text style={styles.emptyNotiText}>Chưa có thông báo nào mới</Text>
                                <Text style={{ fontSize: 12, color: '#BDBDBD', marginTop: 4 }}>Chúng tôi sẽ báo cho bạn khi có tin mới!</Text>
                              </View>
                            )}
                          </ScrollView>
                          
                          <TouchableOpacity 
                            onPress={() => router.push('/notifications')}
                            style={styles.notiFooter}
                          >
                            <Text style={styles.notiFooterText}>Xem tất cả thông báo</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      trigger={['hover']}
                      placement="bottomRight"
                      styles={{ root: { paddingTop: 10 } }}
                    >
                      <Pressable
                        style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                      >
                        <BellOutlined style={{ fontSize: 22, color: '#8D6E63' }} />
                        {unreadCount > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                          </View>
                        )}
                      </Pressable>
                    </Dropdown>
                  ) : (
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
                  )}

                  {Platform.OS === 'web' ? (
                    <Dropdown
                      menu={{ items: userMenuItems }}
                      placement="bottomRight"
                      trigger={['hover']}
                      styles={{ root: { paddingTop: 10 } }}
                    >
                      <Pressable style={({ pressed }) => [styles.userIconBtn, pressed && styles.iconActionPressed]}>
                        {userAvatar ? (
                          <Image 
                            source={{ uri: userAvatar }} 
                            style={styles.avatarImage} 
                            resizeMode="cover" 
                          />
                        ) : (
                          <UserOutlined style={{ fontSize: 20, color: '#FFFFFF' }} />
                        )}
                      </Pressable>
                    </Dropdown>
                  ) : (
                    <Pressable
                      onPress={() => router.push(`/users/${getCurrentUserId() || 'me'}`)}
                      style={({ pressed }) => [styles.iconActionBtn, pressed && styles.iconActionPressed]}
                    >
                      <Image 
                        source={userAvatar ? { uri: userAvatar } : UserIcon} 
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
                  <IconRenderer 
                    icon={item.icon} 
                    size={24} 
                    tint={isOnPage ? '#FFB300' : '#8D6E63'} 
                  />
                  <Text style={[
                    styles.mobileMenuText,
                    isOnPage && { color: '#FFB300', fontWeight: '800' }
                  ]}>
                    {item.label}
                  </Text>
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
  navIconWrapCompact: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
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
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  notiDropdown: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: 360,
    maxHeight: 520,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 32px rgba(93, 64, 55, 0.15)',
    }),
    borderWidth: 1,
    borderColor: '#EEDCC5',
  },
  notiHeader: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAF9F6',
  },
  notiTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5D4037',
    letterSpacing: -0.5,
  },
  notiSubtitle: {
    fontSize: 12,
    color: '#8D6E63',
    marginTop: 2,
    fontWeight: '500',
  },
  notiReadAll: {
    fontSize: 13,
    color: '#FFB300',
    fontWeight: '700',
    marginTop: 4,
  },
  notiList: {
    maxHeight: 420,
  },
  notiItem: {
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    flexDirection: 'row',
    gap: 14,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  notiItemUnread: {
    backgroundColor: '#FFF9F0',
  },
  notiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notiItemContent: {
    flex: 1,
  },
  notiItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  notiItemTitleUnread: {
    fontWeight: '800',
    color: '#5D4037',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFB300',
    marginLeft: 8,
  },
  notiItemText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  notiItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  notiItemTime: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
  },
  emptyNoti: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotiText: {
    fontSize: 15,
    color: '#5D4037',
    fontWeight: '700',
  },
  notiFooter: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAF9F6',
  },
  notiFooterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5D4037',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 16,
  },
  tabItem: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#FFB300',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8D6E63',
  },
  tabLabelActive: {
    color: '#FFB300',
    fontWeight: '800',
  },
  mobileDropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEDCC5',
    paddingVertical: 8,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(93, 64, 55, 0.1)',
    }),
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  mobileMenuItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  mobileMenuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5D4037',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
  },
  mobileLogoutText: {
    color: '#D45A54',
  },
  mobileSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  hamburgerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerText: {
    fontSize: 28,
    color: '#8D6E63',
  },
})
