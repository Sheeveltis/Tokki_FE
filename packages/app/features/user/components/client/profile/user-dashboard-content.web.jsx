import React, { useEffect, useState, useRef } from 'react'
import { Image, StyleSheet, Text, View, Platform, ScrollView, Pressable } from 'react-native'
import { Spin } from 'antd'

import { getCurrentUser, updateBasicInfo, uploadAvatar, uploadAvatarToCloudinary, getTitleById, getProgress } from '../../../api/profile'
import { getPaymentHistory } from '../../../api/get-payment-history'
import { getCurrentUserId } from '../../../../../provider/api/client'
import { showAdminSuccess } from '../../../../../../components/HelperAdmin'
import { BasicInfo } from './basic-info'
import { ProfileEditModal } from './profile-edit-modal'
import { UserExp } from './user-exp'
import { UserStreak } from './user-streak'
import { UserTitle } from './user-title'
import { UserTitlesModal } from './user-titles-modal'
import { PaymentHistoryContent } from '../payment-history/payment-history-content'
import { UserExamHistoryContent } from './user-exam-history-content'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * UserDashboardContent: Nội dung chính thống nhất cho Dashboard người dùng (Web)
 * Bao gồm tất cả các phần: Thông tin, Lộ trình (placeholder), Lịch sử thanh toán.
 */
export function UserDashboardContent({
  scrollRef,
  user,
  onlyProfile = false,
  onlyHistory = false,
  onUserUpdate,
  exams,
  examsLoading,
  examsError
}) {
  const [userData, setUserData] = useState(user || null)
  const [loading, setLoading] = useState(!user)
  const [error, setError] = useState(null)
  const [titleData, setTitleData] = useState(null)
  const [progressData, setProgressData] = useState(null)

  // State for payments
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [paymentsError, setPaymentsError] = useState(null)
  const [isTitlesModalVisible, setIsTitlesModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)

  const showAll = !onlyProfile && !onlyHistory

  useEffect(() => {
    if (user) {
      setUserData(user)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userData) {
          setLoading(true)
          const data = await getCurrentUser()
          setUserData(data)
        }

        try {
          const prog = await getProgress()
          setProgressData(prog)
        } catch (progErr) {
          console.warn('Error fetching progress:', progErr)
        }

        const currentUserData = userData || user
        if (currentUserData?.currentTitle) {
          try {
            const titleInfo = await getTitleById(currentUserData.currentTitle)
            setTitleData(titleInfo)
          } catch (titleErr) {
            console.warn('Error fetching title data:', titleErr)
          }
        }

        // Fetch payments if showing history or showing all
        if (onlyHistory || showAll) {
          const userId = getCurrentUserId()
          if (userId) {
            setPaymentsLoading(true)
            try {
              const history = await getPaymentHistory(userId)
              setPayments(history || [])
            } catch (hErr) {
              console.error('Error fetching payments:', hErr)
              setPaymentsError('Không thể tải lịch sử thanh toán')
            } finally {
              setPaymentsLoading(false)
            }
          }
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Không thể tải thông tin')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userData, user, onlyHistory, showAll])

  const handleProfileUpdate = async (values) => {
    try {
      const formattedDate = (values.dateOfBirth && typeof values.dateOfBirth.format === 'function')
        ? values.dateOfBirth.format('YYYY-MM-DD')
        : (typeof values.dateOfBirth === 'string' ? values.dateOfBirth : (userData?.dateOfBirth ? String(userData.dateOfBirth).split('T')[0] : null))

      const updatedData = await updateBasicInfo({
        fullName: (values.fullName || '').trim(),
        phoneNumber: values.phoneNumber || null,
        dateOfBirth: formattedDate,
        avatarUrl: userData?.avatarUrl || user?.avatarUrl || null
      })

      setUserData(updatedData)
      setIsEditModalVisible(false)
      showAdminSuccess('Cập nhật thông tin thành công')

      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      console.error('Error updating info:', err)
      alert(err.message || 'Không thể cập nhật')
    }
  }

  const handleAvatarUpload = async (fileOrUrl) => {
    try {
      const cloudinaryUrl = await uploadAvatarToCloudinary(fileOrUrl)

      const payload = {
        fullName: userData?.fullName || '',
        phoneNumber: userData?.phoneNumber || null,
        dateOfBirth: userData?.dateOfBirth ? String(userData.dateOfBirth).split('T')[0] : null,
        avatarUrl: cloudinaryUrl
      }

      await uploadAvatar(payload)
      const refreshedUser = await getCurrentUser()
      setUserData(refreshedUser)
      showAdminSuccess('Cập nhật avatar thành công')

      if (onUserUpdate) onUserUpdate()
    } catch (err) {
      console.error('Error uploading avatar:', err)
      alert(err.message || 'Không thể upload avatar')
    }
  }

  // Remove the block return if (loading) { ... }
  // We will handle loading inside the main return below.

  const basicInfoData = {
    username: userData?.fullName || '',
    email: userData?.email || '',
    phone: userData?.phoneNumber || '',
    dateOfBirth: userData?.dateOfBirth ? String(userData.dateOfBirth).slice(0, 10) : '',
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {loading ? (
        <View style={styles.loadingWrapper}>
          <Spin size="large" />
          <Text style={styles.loadingText}>Đang chuẩn bị nội dung...</Text>
        </View>
      ) : (
        <>
          {/* SECTION: PROFILE */}
          {(onlyProfile || showAll) && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Thông tin người dùng</Text>
                <Text style={styles.sectionSubtitle}>Quản lí thông tin tài khoản và thuộc tính cá nhân của bạn.</Text>
              </View>

              <View style={styles.mainContent}>
                <View style={styles.basicWrap}>
                  <BasicInfo
                    initialInfo={basicInfoData}
                    onEditPress={() => setIsEditModalVisible(true)}
                  />
                </View>

                <View style={styles.expStreakRow}>
                  <View style={styles.leftColumn}>
                    <View style={styles.titleWrap}>
                      <UserTitle
                        title={titleData?.name || userData?.currentTitle || null}
                        icon={titleData?.iconUrl || userData?.titleIcon || '🏆'}
                        colorHex={titleData?.colorHex || ''}
                        onPress={() => setIsTitlesModalVisible(true)}
                      />
                    </View>
                    <View style={styles.expWrap}>
                      <UserExp progress={progressData} />
                    </View>
                  </View>
                  <View style={styles.streakWrap}>
                    <UserStreak
                      currentStreak={progressData?.streak || 0}
                      maxStreak={userData?.maxStreak || 0}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {showAll && <View style={styles.divider} />}

          {/* SECTION: EXAM HISTORY */}
          {showAll && (
            <View style={styles.section}>
              <UserExamHistoryContent
                exams={exams}
                loading={examsLoading}
                error={examsError}
              />
            </View>
          )}

          {showAll && <View style={styles.divider} />}

          {/* SECTION: HISTORY */}
          {(onlyHistory || showAll) && (
            <View style={styles.section}>
              {!onlyHistory && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
                  <Text style={styles.sectionSubtitle}>Xem lại các giao dịch thanh toán của bạn.</Text>
                </View>
              )}
              <PaymentHistoryContent
                payments={payments}
                loading={paymentsLoading}
                error={paymentsError}
              />
            </View>
          )}

          <View style={{ height: 40 }} />

          <UserTitlesModal
            visible={isTitlesModalVisible}
            onClose={() => setIsTitlesModalVisible(false)}
            onUserUpdate={onUserUpdate}
          />

          <ProfileEditModal
            open={isEditModalVisible}
            initialValues={basicInfoData}
            onOk={handleProfileUpdate}
            onCancel={() => setIsEditModalVisible(false)}
          />
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 32,
    gap: 32,
  },
  section: {
    width: '100%',
  },
  sectionHeader: {
    marginBottom: 24,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    color: '#20130A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  mainContent: {
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
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  placeholderCard: {
    backgroundColor: '#FFF9F0',
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F1BE4B',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#8A6D3B',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
  loadingWrapper: {
    padding: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    color: '#999',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
})
