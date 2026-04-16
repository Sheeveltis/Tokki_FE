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
export function UserExp({ label = 'Kinh nghiệm', progress, variant = 'default' }) {
  const [loading, setLoading] = useState(!progress)
  const [progressData, setProgressData] = useState(progress || null)

  useEffect(() => {
    if (progress) {
      setProgressData(progress)
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        setLoading(true)
        const data = await getProgress()
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
      <View style={styles.header}>
        <View style={styles.labelSection}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.xpText}>Cấp {progressData.level}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelValue}>{progressData.progressPercentage}%</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelSection: {
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelBadge: {
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.3)',
  },
  levelValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpDetail: {
    fontFamily: 'Epilogue, sans-serif',
  },
  xpCurrent: {
    fontSize: 15,
    fontWeight: '800',
    color: '#20130A',
  },
  xpTarget: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  xpNeeded: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0A0A0',
    fontFamily: 'Epilogue, sans-serif',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: '#A0A0A0',
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

