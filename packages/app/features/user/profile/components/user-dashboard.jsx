import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'

import BunnyIcon from '../../../../../assets/user.png'
import InfoIcon from '../../../../../assets/userInfo.png'
import RoadmapIcon from '../../../../../assets/roadmap2.png'
import PaymentIcon from '../../../../../assets/paymentHistory.png'
import LogoutIcon from '../../../../../assets/logout.png'

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

export function UserDashboard({ onActionPress, initialActive = 'profile' }) {
  const [active, setActive] = useState(initialActive || 'profile')

  const handlePress = (key) => {
    setActive(key)
    if (onActionPress) onActionPress(key)
  }

  return (
    <View style={styles.container}>
      <Image
        source={normalizeImageSource(BunnyIcon)}
        style={styles.avatar}
        resizeMode="contain"
        accessibilityLabel="Tokki bunny"
      />

      <View style={styles.menu}>
        {DASHBOARD_ACTIONS.map((action) => {
          const isActive = active === action.key
          return (
            <Pressable
              key={action.key}
              onPress={() => handlePress(action.key)}
              style={({ pressed, hovered }) => [
                styles.menuItem,
                isActive && styles.menuItemActive,
                (pressed || hovered) && styles.menuItemHovered,
              ]}
            >
              <Image source={normalizeImageSource(action.icon)} style={styles.menuIcon} resizeMode="contain" />
              <Text style={styles.menuText}>{action.label}</Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // nền đúng mã màu yêu cầu
    backgroundColor: '#F5F0DD',
    borderRadius: 30,
    paddingVertical: 36,
    paddingHorizontal: 24,
    width: 340,
    alignItems: 'center',
    gap: 32,
    // nhẹ bóng giống mẫu
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  avatar: {
    width: 112,
    height: 112,
  },
  menu: {
    width: '100%',
    gap: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 14,
    backgroundColor: 'transparent',
  },
  menuItemHovered: {
    transform: [{ scale: 1.02 }],
  },
  menuItemActive: {
    backgroundColor: '#FFDCAA',
  },
  menuIcon: {
    width: 40,
    height: 40,
    marginLeft: 2,
  },
  menuText: {
    fontSize: 18,
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '700',
  },
})


