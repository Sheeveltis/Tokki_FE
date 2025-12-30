import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

/**
 * Component hiển thị thanh kinh nghiệm (EXP) của người dùng
 * @param {Object} props
 * @param {number} props.totalXP - Tổng kinh nghiệm hiện tại (từ API)
 * @param {number} props.level - Cấp độ hiện tại (từ API)
 * @param {string} props.label - Label hiển thị (mặc định "Kinh nghiệm")
 */
export function UserExp({ totalXP = 0, label = 'Kinh nghiệm' }) {
  // Tính maxExp dựa trên level: mỗi level cần 100 XP để lên cấp
  // Level 1: 0-100, Level 2: 100-200, Level 3: 200-300, ...
  // Tính currentExp trong level hiện tại (XP còn lại trong level)
  const currentExp = totalXP % 100
  
  const progressAnim = useRef(new Animated.Value(0)).current
  const percentage = Math.min((currentExp / 100) * 100, 100)

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start()
  }, [percentage, progressAnim])

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>

      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalXPText}>Tổng: {totalXP} XP</Text>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
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
    backgroundColor: '#FFDCAA',
    borderRadius: 6,
    shadowColor: '#FFDCAA',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalXPText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

