import { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, Platform } from 'react-native'

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

  const handleBasicInfoSubmit = async ({ username, phone, dateOfBirth }) => {
    try {
      const updatedData = await updateBasicInfo({
        fullName: (username || '').trim(),
        phoneNumber: phone,
        dateOfBirth: dateOfBirth || userData?.dateOfBirth || '',
      })

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

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      if (!fileOrUrl) {
        throw new Error('Không có file ảnh để upload')
      }

      // 1) Upload file lên Cloudinary endpoint để nhận URL
      const cloudinaryUrl = await uploadAvatarToCloudinary(fileOrUrl)

      // 2) Gửi URL đó vào PUT /Account/profile (avatarUrl)
      await uploadAvatar(cloudinaryUrl)

      // 3) Lấy lại account/me để luôn đồng bộ avatarUrl mới nhất từ server
      const refreshedUser = await getCurrentUser()
      setUserData(refreshedUser)

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
    <View style={styles.container}>
      <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.title}>Thông tin người dùng</Text>
        <Text style={styles.subtitle}>Quản lí thông tin tài khoản của bạn và cập nhật thông tin cơ bản.</Text>
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
          <View style={styles.titleWrap}>
            <UserTitle
              title={titleData?.name || userData.currentTitle || null}
              icon={titleData?.iconUrl || userData.titleIcon || '🏆'}
              colorHex={titleData?.colorHex || ''}
            />
          </View>
          <View style={styles.expWrap}>
            <UserExp />
          </View>
        </View>
        <View style={styles.streakWrap}>
          <UserStreak
            currentStreak={userData.currentStreak || 0}
            maxStreak={userData.maxStreak || 0}
          />
        </View>
      </View>
    </View>
  )
}

const getStyles = () => {
  const isWeb = Platform.OS === 'web'

  return StyleSheet.create({
    container: {
      backgroundColor: '#F5F0DD',
      borderRadius: 30,
      paddingVertical: 20,
      paddingHorizontal: 20,
      gap: 14,
      position: 'relative',
      height: '100%',
      overflow: isWeb ? 'visible' : 'hidden',
    },
    // Web carrot
    carrot: {
      position: 'absolute',
      top: -62,
      right: -72,
      width: 190,
      height: 110,
      zIndex: 30,
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
      gap: 4,
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
      minHeight: 230,
    },
    basicWrap: {
      flex: 1,
      minHeight: 230,
    },
    avatarWrap: {
      width: 220,
      minHeight: 230,
      height: '100%',
    },
    expStreakRow: {
      flexDirection: 'row',
      gap: 16,
      width: '100%',
      alignItems: 'stretch',
      flex: 1,
      minHeight: 0,
    },
    leftColumn: {
      flex: 1,
      gap: 16,
      minHeight: 0,
    },
    expWrap: {
      width: '100%',
      flex: 1,
      minHeight: 0,
    },
    titleWrap: {
      width: '100%',
      flex: 1,
      minHeight: 0,
    },
    streakWrap: {
      flex: 1,
      minHeight: 0,
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

