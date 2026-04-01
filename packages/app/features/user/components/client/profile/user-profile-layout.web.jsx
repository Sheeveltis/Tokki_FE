import React, { useEffect, useState } from 'react'
import { ImageBackground, StyleSheet, View, Platform } from 'react-native'
import { UserDashboard } from '../../admin/user-management/user-dashboard'
import { UserDashboardContent } from './user-dashboard-content.web'
import BgPattern from '../../../../../../assets/background2.png'
import { getCurrentUser, uploadAvatar, uploadAvatarToCloudinary, getExamHistory } from '../../../api/profile'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'
import { UserExamHistoryContent } from './user-exam-history-content'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function UserProfileLayout() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [exams, setExams] = useState([])
  const [examsLoading, setExamsLoading] = useState(false)
  const [examsError, setExamsError] = useState(null)

  const fetchUser = async () => {
    try {
      const data = await getCurrentUser()
      setUser(data)
    } catch (err) {
      console.error('Error fetching user for layout:', err)
    }
  }

  const fetchExams = async () => {
    try {
      setExamsLoading(true)
      const data = await getExamHistory(1, 10)
      setExams(data?.items || [])
    } catch (err) {
      console.error('Error fetching exam history:', err)
      setExamsError('Không thể tải lịch sử làm bài')
    } finally {
      setExamsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
    fetchExams()
  }, [])

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      const cloudinaryUrl = await uploadAvatarToCloudinary(fileOrUrl)

      const payload = {
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || null,
        dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).split('T')[0] : null,
        avatarUrl: cloudinaryUrl
      }

      await uploadAvatar(payload)
      await fetchUser() // Refresh local user state
      showAdminSuccess('Cập nhật avatar thành công')
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert(err.message || 'Không thể upload avatar')
    }
  }

  const handleActionPress = (actionKey) => {
    if (actionKey === 'logout') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('token-changed'))
      }
      return
    }

    setActiveTab(actionKey)
  }

  return (
    <View style={styles.root}>
      <ImageBackground
        // source={normalizeImageSource(BgPattern)}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
      >
        <View style={styles.content}>
          <View style={styles.board}>
            <View style={styles.sidebarSection}>
              <UserDashboard onActionPress={handleActionPress} initialActive={activeTab} noContainer={true} user={user} onAvatarPress={handleAvatarUpload} />
            </View>
            <View style={styles.divider} />
            <View style={styles.mainSection}>
              {activeTab === 'profile' && <UserDashboardContent user={user} onlyProfile={true} onUserUpdate={fetchUser} exams={exams} examsLoading={examsLoading} examsError={examsError} />}
              {activeTab === 'roadmap' && (
                <View style={{ flex: 1, padding: 32 }}>
                  <UserExamHistoryContent 
                    exams={exams} 
                    loading={examsLoading} 
                    error={examsError} 
                  />
                </View>
              )}
              {activeTab === 'history' && <UserDashboardContent user={user} onlyHistory={true} onUserUpdate={fetchUser} />}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.1,
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 'calc(100vh - 72px)',
  },
  board: {
    width: '100%',
    maxWidth: 1400,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sidebarSection: {
    backgroundColor: '#FBFBFB', // Subtle grey for sidebar
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#F2F2F2',
  },
  divider: {
    width: 0, // No visible physical divider, using border on sidebarSection
  },
  mainSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
})

