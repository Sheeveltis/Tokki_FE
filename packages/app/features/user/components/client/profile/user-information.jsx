import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, ScrollView, Platform } from 'react-native'

import Carrot from '../../../../../../assets/carrot.png'
import UserIcon from '../../../../../../assets/user.png'
import { getCurrentUser, updateBasicInfo, updateSecurityInfo, uploadAvatar, getTitleById } from '../../../api/profile'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'
import { BasicInfo } from './basic-info'
import { SecurityInfo } from './security-info'
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
 * Split fullName into firstName and lastName
 * If fullName has space, split by space; otherwise use fullName as lastName
 */
const splitFullName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' }
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return { firstName: '', lastName: parts[0] }
  }
  const lastName = parts.pop()
  const firstName = parts.join(' ')
  return { firstName, lastName }
}

export function UserInformation() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [titleData, setTitleData] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const data = await getCurrentUser()
        setUserData(data)
        setError(null)

        // Nếu có titleId, fetch thông tin title
        if (data?.currentTitle) {
          try {
            const titleInfo = await getTitleById(data.currentTitle)
            setTitleData(titleInfo)
          } catch (titleErr) {
            console.warn('Error fetching title data:', titleErr)
            // Không set error vì title không phải là thông tin bắt buộc
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setError(err.message || 'Không thể tải thông tin người dùng')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleBasicInfoSubmit = async ({ firstName, lastName }) => {
    try {
      const fullName = `${firstName} ${lastName}`.trim()
      const updatedData = await updateBasicInfo({ fullName })
      setUserData(updatedData)
      showAdminSuccess('Cập nhật thông tin cơ bản thành công')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      console.error('Error updating basic info:', err)
      alert(err.message || 'Không thể cập nhật thông tin')
    }
  }

  const handleSecurityInfoUpdate = async ({ phone }) => {
    try {
      const updatedData = await updateSecurityInfo({ phoneNumber: phone })
      setUserData(updatedData)
      showAdminSuccess('Cập nhật số điện thoại thành công')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      console.error('Error updating security info:', err)
      alert(err.message || 'Không thể cập nhật thông tin bảo mật')
    }
  }

  const handleChangePassword = () => {
    // TODO: Implement change password flow
    alert('Chức năng đổi mật khẩu sẽ được triển khai sau')
  }

  const handleAvatarUpdate = async (avatarUrl) => {
    try {
      const updatedData = await uploadAvatar(avatarUrl)
      setUserData(updatedData)
      showAdminSuccess('Cập nhật avatar thành công')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      console.error('Error updating avatar:', err)
      alert(err.message || 'Không thể cập nhật avatar')
    }
  }

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      let avatarData = fileOrUrl

      // Nếu là file trên web: convert to base64 data URL rồi gửi avatarUrl
      if (Platform.OS === 'web' && typeof window !== 'undefined' && fileOrUrl instanceof File) {
        avatarData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(fileOrUrl)
        })
      }

      const updatedData = await uploadAvatar(avatarData)
      setUserData(updatedData)
      showAdminSuccess('Cập nhật avatar thành công')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert(err.message || 'Không thể upload avatar')
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    )
  }

  if (error || !userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không thể tải thông tin người dùng'}</Text>
      </View>
    )
  }

  const { firstName, lastName } = splitFullName(userData.fullName || '')

  // Web layout: two-column with dashboard
  if (Platform.OS === 'web') {
    const avatarSource =
      userData.avatarUrl && userData.avatarUrl !== 'null' && userData.avatarUrl !== null
        ? { uri: userData.avatarUrl }
        : UserIcon

    const userAvatarData = {
      name: userData.fullName || '',
      phone: userData.phoneNumber || '',
      avatar: avatarSource,
    }

    const basicInfoData = {
      firstName: '',
      lastName: userData.fullName || '',
    }

    const securityInfoData = {
      email: userData.email || '',
      password: '**********', 
      phone: userData.phoneNumber || '',
    }

    return (
      <View style={styles.container}>
        <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

        <View style={styles.header}>
          <Text style={styles.title}>Thông tin người dùng</Text>
          <Text style={styles.subtitle}>
            Quản lí thông tin tài khoản của bạn, bạn có thể xem trạng thái tài khoản và đổi mật khẩu.
          </Text>
        </View>

        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            <UserAvatarCard user={userAvatarData} onAvatarPress={handleAvatarUpload} />
          </View>
          <View style={styles.basicWrap}>
            <BasicInfo initialInfo={basicInfoData} onSubmit={handleBasicInfoSubmit} />
          </View>
        </View>

        <View style={styles.expStreakRow}>
          <View style={styles.leftColumn}>
            <View style={styles.expWrap}>
              <UserExp />
            </View>
            <View style={styles.titleWrap}>
              <UserTitle 
                title={titleData?.name || userData.currentTitle || null}
                icon={titleData?.iconUrl || userData.titleIcon || '🏆'}
              />
            </View>
          </View>
          <View style={styles.streakWrap}>
            <UserStreak 
              currentStreak={userData.currentStreak || 0} 
              maxStreak={userData.maxStreak || 0} 
            />
          </View>
        </View>

        <View style={styles.securityWrap}>
          <SecurityInfo
            initialData={securityInfoData}
            onUpdate={handleSecurityInfoUpdate}
            onChangePassword={handleChangePassword}
          />
        </View>
      </View>
    )
  }

  // Native layout: vertical scrollable
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerNative}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.titleNative}>Thông tin người dùng</Text>
          <Text style={styles.subtitleNative}>
            Quản lí thông tin tài khoản của bạn, bạn có thể xem trạng thái tài khoản và đổi mật khẩu.
          </Text>
        </View>
      </View>

      {/* User Avatar Card */}
      <View style={styles.section}>
        <UserAvatarCard
          avatarUrl={userData.avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </View>

      {/* User Info Cards - Stacked vertically for mobile */}
      <View style={styles.cardsContainer}>
        {/* Left column - Experience and Title */}
        <View style={styles.leftColumn}>
          {/* Experience Card */}
          <View style={styles.card}>
            <UserExp />
          </View>

          {/* Title Card */}
          <View style={styles.card}>
            <UserTitle 
              title={titleData?.name || userData.currentTitle || null}
              icon={titleData?.iconUrl || '🏆'}
            />
          </View>
        </View>

        {/* Right column - Streak */}
        <View style={styles.rightColumn}>
          <View style={styles.card}>
            <UserStreak 
              currentStreak={userData.currentStreak || 0} 
              maxStreak={userData.maxStreak || 0} 
            />
          </View>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <BasicInfo
          firstName={firstName}
          lastName={lastName}
          onSubmit={handleBasicInfoSubmit}
        />
      </View>

      {/* Security Info */}
      <View style={styles.section}>
        <SecurityInfo
          phone={userData.phoneNumber || ''}
          onUpdate={handleSecurityInfoUpdate}
        />
      </View>
    </ScrollView>
  )
}

const getStyles = () => {
  const isWeb = Platform.OS === 'web'
  
  return StyleSheet.create({
    container: {
      backgroundColor: '#F5F0DD',
      borderRadius: 30,
      paddingVertical: 24,
      paddingHorizontal: 20,
      gap: 18,
      position: 'relative',
    },
    // Web carrot
    carrot: {
      position: 'absolute',
      top: -50,
      right: -100,
      width: 200,
      height: 100,
      zIndex: 2,
      pointerEvents: 'none',
    },
    // Native carrot
    carrotNative: {
      position: 'absolute',
      top: 10,
      right: 40,
      width: 200,
      height: 100,
      zIndex: 2,
      pointerEvents: 'none',
    },
    // Native scroll content
    scrollContent: {
      paddingHorizontal: isWeb ? 16 : 0, // Less padding on native for wider cards
      paddingTop: 20,
      paddingBottom: 20,
    },
  // Native header
  headerNative: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  titleNative: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleNative: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
    textAlign: 'center',
  },
  // Native sections
  section: {
    marginBottom: 20,
    width: '100%', // Ensure full width on native
  },
  cardsContainer: {
    flexDirection: 'column', // Stack vertically on mobile
    gap: 16,
    marginBottom: 20,
    width: '100%', // Ensure full width
  },
  leftColumn: {
    flex: 1,
    gap: 16,
    width: '100%', // Full width on native
  },
  rightColumn: {
    flex: 1,
    width: '100%', // Full width on native
  },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: isWeb ? 16 : 20, // More padding on native
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      width: '100%', // Ensure full width
      minWidth: isWeb ? 280 : '100%', // No minWidth constraint on native
    },
  header: {
    gap: 6,
    paddingRight: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
  },
  subtitle: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  topRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  basicWrap: {
    flex: 1,
    minHeight: 200,
  },
  avatarWrap: {
    width: 220,
    minHeight: 200,
  },
  expStreakRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    alignItems: 'stretch',
  },
  leftColumn: {
    flex: 1,
    gap: 16,
  },
  expWrap: {
    width: '100%',
  },
  titleWrap: {
    width: '100%',
  },
  streakWrap: {
    flex: 1,
  },
  securityWrap: {
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 40,
    fontFamily: 'Epilogue, sans-serif',
  },
    errorText: {
      fontSize: 16,
      color: '#E74C3C',
      textAlign: 'center',
      paddingVertical: 40,
      fontFamily: 'Epilogue, sans-serif',
    },
  })
}

const styles = getStyles()

