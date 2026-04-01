import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import BunnyIcon from '../../../../../../assets/user.png'
import InfoIcon from '../../../../../../assets/icon/navigate-app/user-svgrepo-com.svg'
import RoadmapIcon from '../../../../../../assets/icon/navigate-app/roadmap.svg'
import PaymentIcon from '../../../../../../assets/icon/navigate-app/layers-svgrepo-com.svg'
import LogoutIcon from '../../../../../../assets/icon/icon-mainflow/logout.svg'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const DASHBOARD_ACTIONS = [
  { key: 'profile', label: 'Thông tin người dùng', icon: InfoIcon },
  { key: 'roadmap', label: 'Lộ trình học', icon: RoadmapIcon },
  { key: 'history', label: 'Lịch sử thanh toán', icon: PaymentIcon },
  { key: 'logout', label: 'Đăng xuất', icon: LogoutIcon },
]

export function UserDashboard({ onActionPress, initialActive = 'profile', noContainer = false, user, onAvatarPress }) {
  const [active, setActive] = useState(initialActive || 'profile')

  const handlePress = (key) => {
    setActive(key)
    if (onActionPress) onActionPress(key)
  }

  const avatarSource = user?.avatarUrl && user.avatarUrl !== 'null'
    ? { uri: user.avatarUrl }
    : BunnyIcon

  return (
    <View style={noContainer ? styles.containerEmpty : styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarOuterRing}>
          <Pressable 
            onPress={onAvatarPress} 
            style={({ hovered }) => [
                styles.avatarInnerRing,
                onAvatarPress && hovered && styles.avatarInnerRingHovered
            ]}
          >
            <Image
              source={normalizeImageSource(avatarSource)}
              style={styles.avatar}
              resizeMode="cover"
              accessibilityLabel="User avatar"
            />
            {onAvatarPress && (
              <View style={styles.editBadge}>
                <Text style={styles.editIcon}>📷</Text>
              </View>
            )}
          </Pressable>
        </View>
        <View style={styles.welcomeInfo}>
          <Text style={styles.welcomeSmall}>Chào bạn,</Text>
          <Text style={styles.welcomeName} numberOfLines={1}>
            {user?.fullName || 'Người dùng'}
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        {DASHBOARD_ACTIONS.map((action) => {
          const isActive = active === action.key
          return (
            <Pressable
              key={action.key}
              onPress={() => handlePress(action.key)}
              style={({ pressed, hovered }) => {
                const isHovered = hovered && !isActive
                return [
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                  isHovered && styles.menuItemHovered,
                ]
              }}
            >
              {({ hovered }) => (
                <>
                  <View style={styles.menuIconContainer}>
                    <StudyIcon 
                      source={action.icon} 
                      width={28} 
                      height={28} 
                      tintColor={isActive ? '#FFFFFF' : (hovered ? '#F1BE4B' : '#666')} 
                    />
                  </View>
                  <Text style={[styles.menuText, isActive && styles.menuTextActive]}>{action.label}</Text>
                </>
              )}
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: 320,
    alignItems: 'center',
    gap: 40,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  containerEmpty: {
    backgroundColor: 'transparent',
    paddingVertical: 40,
    paddingHorizontal: 20,
    width: 320,
    alignItems: 'center',
    gap: 40,
  },
  avatarSection: {
    alignItems: 'center',
    gap: 16,
  },
  avatarOuterRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.2)',
  },
  avatarInnerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarInnerRingHovered: {
    transform: [{ scale: 1.02 }],
    borderColor: '#F1BE4B',
    borderWidth: 1,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  welcomeInfo: {
    alignItems: 'center',
    gap: 4,
  },
  welcomeSmall: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    width: 260,
  },
  menu: {
    width: '100%',
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  menuItemHovered: {
    backgroundColor: '#FFF9F0',
    transform: [{ translateX: 4 }],
  },
  menuItemActive: {
    backgroundColor: '#F1BE4B',
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 28,
    height: 28,
  },
  menuText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
    flex: 1,
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
})

