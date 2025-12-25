import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

/**
 * Component hiển thị thanh kinh nghiệm (EXP) của người dùng
 * @param {Object} props
 * @param {number} props.currentExp - Kinh nghiệm hiện tại
 * @param {number} props.maxExp - Kinh nghiệm tối đa (mặc định 100)
 * @param {string} props.label - Label hiển thị (mặc định "Kinh nghiệm")
 */
export function UserExp({ currentExp = 0, maxExp = 100, label = 'Kinh nghiệm' }) {
  const progressAnim = useRef(new Animated.Value(0)).current
  const percentage = Math.min((currentExp / maxExp) * 100, 100)

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
        <Text style={styles.expText}>
          {currentExp} / {maxExp}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.footer}>
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
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

