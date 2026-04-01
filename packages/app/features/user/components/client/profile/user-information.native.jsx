import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, Platform, ScrollView, RefreshControl } from 'react-native'

import Carrot from '../../../../../../assets/carrot.png'
import UserIcon from '../../../../../../assets/user.png'
import { getCurrentUser, updateBasicInfo, uploadAvatar, uploadAvatarToCloudinary, getTitleById } from '../../../api/profile'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'
import { BasicInfo } from './basic-info'
import { UserAvatarCard } from './user-avt'
import { UserExp } from './user-exp'
import { UserStreak } from './user-streak'
import { UserTitle } from './user-title'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * UserInformation (Mobile Variant)
 * Optimized for small screens with a single column layout
 */
export function UserInformation() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [titleData, setTitleData] = useState(null)

  const fetchUserData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true)
      const data = await getCurrentUser()
      setUserData(data)
      setError(null)

      if (data?.currentTitle) {
        try {
          const titleInfo = await getTitleById(data.currentTitle)
          setTitleData(titleInfo)
        } catch (titleErr) {
          console.warn('Error fetching title data:', titleErr)
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err.message || 'Không thể tải thông tin người dùng')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchUserData(true)
  }

  const handleBasicInfoSubmit = async ({ username, phone, dateOfBirth }) => {
    try {
      const updatedData = await updateBasicInfo({
        fullName: (username || '').trim(),
        phoneNumber: phone,
        dateOfBirth: dateOfBirth || userData?.dateOfBirth || '',
      })

      setUserData(updatedData)
      showAdminSuccess('Cập nhật thông tin cơ bản thành công')
    } catch (err) {
      console.error('Error updating basic info:', err)
      alert(err.message || 'Không thể cập nhật thông tin')
    }
  }

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      if (!fileOrUrl) {
        throw new Error('Không có file ảnh để upload')
      }
      const cloudinaryUrl = await uploadAvatarToCloudinary(fileOrUrl)
      await uploadAvatar(cloudinaryUrl)
      const refreshedUser = await getCurrentUser()
      setUserData(refreshedUser)
      showAdminSuccess('Cập nhật avatar thành công')
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert(err.message || 'Không thể upload avatar')
    }
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    )
  }

  if (error || !userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Không thể tải thông tin người dùng'}</Text>
      </View>
    )
  }

  const avatarSource =
    userData.avatarUrl && userData.avatarUrl !== 'null' && userData.avatarUrl !== null
      ? { uri: userData.avatarUrl }
      : UserIcon

  const userAvatarData = {
    avatar: avatarSource,
  }

  const basicInfoData = {
    username: userData.fullName || '',
    email: userData.email || '',
    phone: userData.phoneNumber || '',
    dateOfBirth: userData.dateOfBirth ? String(userData.dateOfBirth).slice(0, 10) : '',
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFDCAA']} />
      }
    >
      <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.title}>Thông tin người dùng</Text>
        <Text style={styles.subtitle}>Quản lí thông tin tài khoản của bạn.</Text>
      </View>

      {/* 1. Avatar ở trên đầu */}
      <View style={styles.section}>
        <UserAvatarCard user={userAvatarData} onAvatarPress={handleAvatarUpload} />
      </View>

      {/* 2. Thanh XP đặt ở dưới avatar (cấp độ để bên trái) */}
      <View style={styles.section}>
        <UserExp variant="mobile" />
      </View>

      {/* 3. Danh hiệu đặt ở dưới thanh XP */}
      <View style={styles.section}>
        <UserTitle
          title={titleData?.name || userData.currentTitle || null}
          icon={titleData?.iconUrl || userData.titleIcon || '🏆'}
          colorHex={titleData?.colorHex || ''}
        />
      </View>

      {/* 4. Ô chuỗi (Streak) */}
      <View style={styles.section}>
        <UserStreak
          currentStreak={userData.currentStreak || 0}
          maxStreak={userData.maxStreak || 0}
        />
      </View>

      {/* 5. Thông tin cơ bản */}
      <View style={styles.section}>
        <BasicInfo initialInfo={basicInfoData} onSubmit={handleBasicInfoSubmit} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 20,
  },
  carrot: {
    position: 'absolute',
    top: 10,
    right: -20,
    width: 150,
    height: 80,
    zIndex: 2,
    transform: [{ rotate: '15deg' }],
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 4,
  },
  section: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F0DD',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})
