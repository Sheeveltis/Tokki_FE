import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { getProgress } from '../../../api/profile'
import { getCurrentUserId } from '../../../../../provider/api/client'

/**
 * Component hiển thị thanh kinh nghiệm (EXP) của người dùng
 * @param {Object} props
 * @param {string} props.label - Label hiển thị (mặc định "Kinh nghiệm")
 * @param {string} props.variant - Biến thể hiển thị ('default' hoặc 'mobile')
 */
export function UserExp({ label = 'Kinh nghiệm', variant = 'default' }) {
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState(null)

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        // Lấy userId từ token (decode từ JWT)
        const userId = getCurrentUserId()
        console.log('[UserExp] userId từ token:', userId)
        if (!userId) {
          console.warn('[UserExp] Không tìm thấy userId từ token')
          setLoading(false)
          return
        }

        console.log('[UserExp] Đang gọi API getProgress với userId:', userId)
        const data = await getProgress(userId)
        console.log('[UserExp] Data nhận được từ API:', data)
        // Chỉ set data từ API, không dùng giá trị mặc định
        setProgressData(data)
      } catch (error) {
        console.error('[UserExp] Lỗi khi lấy thông tin progress:', error)
        console.error('[UserExp] Error details:', error.response?.data || error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  // Set width trực tiếp từ progressPercentage, không dùng animation
  // Ví dụ: progressPercentage = 54.95 -> width: '54.95%'
  const progressWidth = progressData?.progressPercentage !== undefined
    ? `${progressData.progressPercentage}%`
    : '0%'

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#FFDCAA" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    )
  }

  // Không render nếu chưa có data từ API
  if (!progressData) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorText}>Không thể tải thông tin kinh nghiệm</Text>
      </View>
    )
  }

  // Tính XP còn thiếu để lên cấp: maxXPOfLevel - xpInCurrentLevel
  // Ví dụ: 182 - 100 = 82 XP
  const xpNeeded = progressData.maxXPOfLevel - progressData.xpInCurrentLevel
  const isMobile = variant === 'mobile'

  return (
    <View style={styles.card}>
      <View style={[styles.header, isMobile && { justifyContent: 'flex-start', gap: 12 }]}>
        {isMobile && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>Cấp</Text>
            <Text style={styles.levelValue}>{progressData.level}</Text>
          </View>
        )}
        <Text style={styles.label}>{label}</Text>
        {!isMobile && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>Cấp</Text>
            <Text style={styles.levelValue}>{progressData.level}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.xpText}>Hiện tại: {progressData.xpInCurrentLevel} XP</Text>
          <Text style={styles.xpNeededText}>Cần thêm: {xpNeeded} XP để lên cấp</Text>
        </View>
        <Text style={styles.percentageText}>{Math.round(progressData.progressPercentage)}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
    minWidth: 280,
    width: '100%', // Ensure full width on native
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFDCAA',
    gap: 4,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B6914',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    fontFamily: 'Epilogue, sans-serif',
  },
  expText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFDCAA', // Màu cam nhạt
    borderRadius: 6,
    shadowColor: '#FFDCAA',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // Đảm bảo thanh progress hiển thị rõ ràng
    minWidth: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  footerLeft: {
    flex: 1,
    gap: 4,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpNeededText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#B8B8B8',
    fontFamily: 'Epilogue, sans-serif',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'Epilogue, sans-serif',
  },
})

