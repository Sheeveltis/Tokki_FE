import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BasicInfo } from './basic-info.native'
import { UserTitle } from './user-title.native'
import { ExpInfo } from './user-exp.native'
import { StreakInfo } from './user-streak.native'
import { getCurrentUser, getProgress, getTitleById } from '../../../api/profile'
import { useXp } from 'app/provider/xp'

/**
 * UserDashboardContent (Native): Dashboard thông tin người dùng trên Mobile
 */
export function UserDashboardContent({ onlyProfile = false, showAll = true }) {
  const [userData, setUserData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [titleData, setTitleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { xpState } = useXp()

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        // Fetch basic info and progress (streak) in parallel
        const [user, progress] = await Promise.all([
          getCurrentUser(),
          getProgress()
        ])
        
        setUserData(user)
        setProgressData(progress)
        
        // Fetch title details if currentTitle exists
        if (user?.currentTitle) {
          try {
            const titleDetails = await getTitleById(user.currentTitle)
            setTitleData(titleDetails)
          } catch (e) {
            console.error('[UserDashboardContent] Error fetching title details:', e)
          }
        }
      } catch (error) {
        console.error('[UserDashboardContent] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F1BE4B" />
        <Text style={styles.loadingText}>Đang chuẩn bị nội dung...</Text>
      </View>
    )
  }

  const basicInfoData = {
    username: userData?.fullName || '',
    email: userData?.email || '',
    phoneNumber: userData?.phoneNumber || '',
    dateOfBirth: userData?.dateOfBirth ? String(userData.dateOfBirth).slice(0, 10) : '',
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* PROFILE SECTION */}
      {(onlyProfile || showAll) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin tài khoản</Text>
            <Text style={styles.sectionSubtitle}>Quản lý hồ sơ cá nhân của bạn</Text>
          </View>

          <View style={styles.card}>
            <BasicInfo
              initialInfo={basicInfoData}
              onEditPress={() => {
                // Logic edit modal could be added here later
                console.log('Edit Profile Pressed')
              }}
            />
          </View>
        </View>
      )}

      {/* STATS SECTION (EXP, STREAK, TITLE) */}
      {showAll && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thành tựu & Tiến độ</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.card}>
              <UserTitle
                title={titleData?.name || (userData?.currentTitle ? 'Đang tải...' : 'Thành viên mới')}
                icon={titleData?.iconUrl || '🏆'}
                colorHex={titleData?.colorHex}
              />
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.card, { flex: 1 }]}>
                <ExpInfo
                  progress={progressData}
                />
              </View>
              <View style={[styles.card, { flex: 1 }]}>
                <StreakInfo
                  currentStreak={progressData?.streak || 0}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
})
