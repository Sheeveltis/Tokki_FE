import { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View, Platform } from 'react-native'

import UserIcon from '../../../../../../assets/user.png'
import { getCurrentUser, updateBasicInfo, uploadAvatar, uploadAvatarToCloudinary, getTitleById } from '../../../api/profile'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'
import { BasicInfo } from './basic-info'
import { ProfileEditModal } from './profile-edit-modal'
import { UserAvatarCard } from './user-avt'
import { UserExp } from './user-exp'
import { UserStreak } from './user-streak'
import { UserTitle } from './user-title'
import { UserTitlesModal } from './user-titles-modal'

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
  const [isTitlesModalVisible, setIsTitlesModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)


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

  const handleProfileUpdate = async (values) => {
    try {
      const updatedData = await updateBasicInfo({
        fullName: (values.fullName || '').trim(),
        phoneNumber: values.phoneNumber || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : (userData?.dateOfBirth ? String(userData.dateOfBirth).split('T')[0] : null),
        fullName: (values.fullName || '').trim(),
        phoneNumber: values.phoneNumber || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : (userData?.dateOfBirth ? String(userData.dateOfBirth).split('T')[0] : null),
      })

      setUserData(updatedData)
      setIsEditModalVisible(false)
      showAdminSuccess('Cập nhật thông tin thành công')
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => window.location.reload(), 800)
        setTimeout(() => window.location.reload(), 800)
      }
    } catch (err) {
      console.error('Error updating info:', err)
      alert(err.message || 'Không thể cập nhật')
      console.error('Error updating info:', err)
      alert(err.message || 'Không thể cập nhật')
    }
  }

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      if (!fileOrUrl) {
        throw new Error('Không có file ảnh để upload')
      }

      // 1) Upload file lên Cloudinary endpoint để nhận URL
      const cloudinaryUrl = await uploadAvatarToCloudinary(fileOrUrl)

      // 2) Gửi URL đó vào PUT /Account/profile (avatarUrl) kèm theo các info hiện có
      const payload = {
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || null,
        dateOfBirth: userData.dateOfBirth ? String(userData.dateOfBirth).split('T')[0] : null,
        avatarUrl: cloudinaryUrl
      }
      await uploadAvatar(payload)

      // 3) Lấy lại account/me để luôn đồng bộ avatarUrl mới nhất từ server
      const refreshedUser = await getCurrentUser()
      setUserData(refreshedUser)

      showAdminSuccess('Cập nhật avatar thành công')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload()
        }, 800)
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
      <View style={styles.contentCard}>
        <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

        <View style={styles.header}>
          <View style={styles.headerPattern} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Thông tin người dùng</Text>
            <Text style={styles.subtitle}>Quản lí thông tin tài khoản của bạn và cập nhật thông tin cơ bản.</Text>
          </View>
        </View>
        <View style={styles.header}>
          <View style={styles.headerPattern} />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Thông tin người dùng</Text>
            <Text style={styles.subtitle}>Quản lí thông tin tài khoản của bạn và cập nhật thông tin cơ bản.</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.topRow}>
            <View style={styles.avatarWrap}>
              <UserAvatarCard user={userAvatarData} onAvatarPress={handleAvatarUpload} />
            </View>
            <View style={styles.basicWrap}>
              <BasicInfo 
                initialInfo={basicInfoData} 
                onEditPress={() => setIsEditModalVisible(true)} 
              />
            </View>
          </View>

          <View style={styles.expStreakRow}>
            <View style={styles.leftColumn}>
              <View style={styles.titleWrap}>
                <UserTitle
                  title={titleData?.name || userData.currentTitle || null}
                  icon={titleData?.iconUrl || userData.titleIcon || '🏆'}
                  colorHex={titleData?.colorHex || ''}
                  onPress={() => setIsTitlesModalVisible(true)}
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
      </View>

      <UserTitlesModal 
        visible={isTitlesModalVisible} 
        onClose={() => setIsTitlesModalVisible(false)} 
      />

      <ProfileEditModal
        open={isEditModalVisible}
        initialValues={basicInfoData}
        onOk={handleProfileUpdate}
        onCancel={() => setIsEditModalVisible(false)}
      />
    </View>
  )
}

const getStyles = () => {
  const isWeb = Platform.OS === 'web'

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: '100%',
    },
    contentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 32,
      overflow: 'hidden',
      position: 'relative',
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 5,
      borderWidth: 1,
      borderColor: '#F0F0F0',
    },
    carrot: {
      position: 'absolute',
      top: -20,
      right: -30,
      width: 160,
      height: 100,
      zIndex: 10,
      opacity: 0.8,
      transform: [{ rotate: '15deg' }],
      pointerEvents: 'none',
    },
    header: {
      paddingHorizontal: 32,
      paddingTop: 40,
      paddingBottom: 24,
      position: 'relative',
      backgroundColor: '#FFF9F0',
    },
    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
      backgroundColor: '#F1BE4B',
    },
    headerInfo: {
      position: 'relative',
      zIndex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: '900',
      fontFamily: 'Epilogue, sans-serif',
      color: '#20130A',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: '#666',
      fontFamily: 'Epilogue, sans-serif',
      lineHeight: 22,
      maxWidth: '80%',
    },
    mainContent: {
      padding: 32,
      gap: 24,
    },
    topRow: {
      flexDirection: 'row',
      gap: 24,
      alignItems: 'stretch',
    },
    avatarWrap: {
      width: 260,
    },
    basicWrap: {
      flex: 1,
    },
    expStreakRow: {
      flexDirection: 'row',
      gap: 24,
      width: '100%',
      alignItems: 'stretch',
    },
    leftColumn: {
      flex: 1.2,
      gap: 24,
    },
    titleWrap: {
      width: '100%',
    },
    expWrap: {
      width: '100%',
    },
    streakWrap: {
      flex: 1,
    },
    loadingText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      paddingVertical: 80,
      fontFamily: 'Epilogue, sans-serif',
    },
    errorText: {
      fontSize: 16,
      color: '#E74C3C',
      textAlign: 'center',
      paddingVertical: 80,
      fontFamily: 'Epilogue, sans-serif',
    },
  })
}

const styles = getStyles()
