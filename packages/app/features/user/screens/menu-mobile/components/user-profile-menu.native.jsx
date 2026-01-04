import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, Image, TouchableOpacity, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import UserIcon from '../../../../../../assets/user.png'
import { getCurrentUser } from '../../Profile/api/api'
import { getAuthToken } from '../../../../../provider/api/client'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * User Profile Menu Component (Native)
 * - Displays user profile with avatar, name, phone
 * - Action buttons: Personal Info, Security, Payment History
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7FA14D" />
      </View>
    )
  }

  const fullName = userData?.firstName && userData?.lastName
    ? `${userData.firstName} ${userData.lastName}`
    : userData?.fullName || 'Người dùng'
  const phoneNumber = userData?.phoneNumber || 'Chưa cập nhật'

  return (
    <View style={styles.container}>
      {/* Header with Logout button */}
      <View style={styles.header}>
        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={normalizeImageSource(userData?.avatarUrl ? userData.avatarUrl : UserIcon)}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>

      {/* Name with Edit Icon */}
      <View style={styles.nameContainer}>
        <Text style={styles.userName}>{fullName}</Text>

      </View>

      {/* Phone Number */}
      <Text style={styles.phoneNumber}>{phoneNumber}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Pressable style={styles.actionButton} onPress={onPersonalInfo}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>👤</Text>
          </View>
          <Text style={styles.actionText}>Thông tin cá nhân</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onSecurity}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>🔒</Text>
          </View>
          <Text style={styles.actionText}>Bảo mật</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onPaymentHistory}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>💳</Text>
          </View>
          <Text style={styles.actionText}>Lịch sử thanh toán</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 100, // Padding for navbar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC143C',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E0E0E0',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  editButton: {
    padding: 4,
  },
  editIcon: {
    fontSize: 18,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Epilogue, sans-serif',
  },
  divider: {
    height: 1,
    backgroundColor: '#D9D9D9',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionIconContainer: {
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionText: {
    fontSize: 12,
    color: '#1C1C1C',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
})

