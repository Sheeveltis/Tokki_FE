import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import UserIcon from '../../../../../../assets/user.png'
import InfoIcon from '../../../../../../assets/icon/navigate-app/user-svgrepo-com.svg'
import PaymentIcon from '../../../../../../assets/icon/navigate-app/layers-svgrepo-com.svg'
import LogoutIcon from '../../../../../../assets/icon/icon-mainflow/logout.svg'
import { getCurrentUser } from '../../../api/profile'

/**
 * Normalize image source
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Check if icon is a React component (SVG)
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
 * Render icon - support both Image source and SVG component
 */
const renderIcon = (Icon, isActive = false) => {
  if (!Icon) return null

  const tintColor = isActive ? '#FFFFFF' : '#6A5634'
  const isComponent = isReactComponent(Icon)

  if (isComponent) {
    const IconComponent = typeof Icon === 'function' ? Icon : (Icon.default || Icon)
    return <IconComponent width={28} height={28} fill={tintColor} color={tintColor} />
  }

  const iconSource = normalizeImageSource(Icon)
  if (iconSource) {
    return <Image source={iconSource} style={[styles.menuIcon, { tintColor }]} resizeMode="contain" />
  }

  return null
}

/**
 * User Profile Menu Component (Native)
 */
export function UserProfileMenu({ onPersonalInfo, onSecurity, onPaymentHistory, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const data = await getCurrentUser()
        setUserData(data)
      } catch (error) {
        console.error('[UserProfileMenu] Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F1BE4B" />
      </View>
    )
  }

  const fullName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.fullName || 'Người dùng'

  const avatarSource = userData?.avatarUrl && userData.avatarUrl !== 'null'
    ? { uri: userData.avatarUrl }
    : UserIcon

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarOuterRing}>
          <View style={styles.avatarInnerRing}>
            <Image
              source={normalizeImageSource(avatarSource)}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.editBadge}>
              <Text style={styles.editIcon}>📷</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeSmall}>Chào bạn,</Text>
          <Text style={styles.welcomeName} numberOfLines={1}>
            {fullName}
          </Text>
        </View>
      </View>

      {/* Menu List */}
      <View style={styles.menu}>
        {/* Personal Info - Active/Highlight Style */}
        <TouchableOpacity
          style={[styles.menuItem, styles.menuItemActive]}
          onPress={onPersonalInfo}
        >
          <View style={[styles.menuIconContainer, styles.menuIconContainerActive]}>
            {renderIcon(InfoIcon, true)}
          </View>
          <Text style={[styles.menuText, styles.menuTextActive]}>Thông tin người dùng</Text>
          <Text style={[styles.chevron, styles.chevronActive]}>〉</Text>
        </TouchableOpacity>

        {/* Payment History */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={onPaymentHistory}
        >
          <View style={styles.menuIconContainer}>
            {renderIcon(PaymentIcon, false)}
          </View>
          <Text style={styles.menuText}>Lịch sử thanh toán</Text>
          <Text style={styles.chevron}>〉</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={onLogout}
        >
          <View style={styles.menuIconContainer}>
            {renderIcon(LogoutIcon, false)}
          </View>
          <Text style={styles.menuText}>Đăng xuất</Text>
          <Text style={styles.chevron}>〉</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120, // Increased paddingTop to push content down
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 40,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  avatarOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.2)',
  },
  avatarInnerRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  editIcon: {
    fontSize: 16,
  },
  welcomeInfo: {
    alignItems: 'center',
    gap: 4,
  },
  welcomeSmall: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    width: 280,
  },
  menu: {
    width: '100%',
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  menuItemActive: {
    backgroundColor: '#F1BE4B',
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(241, 190, 75, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 18,
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '700',
    flex: 1,
  },
  menuTextActive: {
    color: '#FFFFFF',
  },
  chevron: {
    fontSize: 20,
    color: '#D9D9D9',
    fontWeight: '400',
  },
  chevronActive: {
    color: '#FFFFFF',
  },
})

