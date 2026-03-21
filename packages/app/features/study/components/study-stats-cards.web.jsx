import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'
import { colors } from '../../../color'
import { normalizeImageSource } from '../api'

import StarIcon from '../../../../assets/icon/decor/19.png'
import LeafIcon from '../../../../assets/icon/decor/18.png'

/**
 * StudyStatsCards: Component hiển thị 2 card thống kê học tập
 * @param {{
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function StudyStatsCards({ lessonsLearned = 30, streakDays = 30 }) {
  return (
    <View style={styles.container}>
      {/* Card: Bạn đã học được */}
      <View style={styles.lessonsCard}>
        <View style={styles.starsContainer}>
          <Image
            source={normalizeImageSource(StarIcon)}
            style={styles.star}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.label}>Bạn đã học được</Text>
        <Text style={styles.value}>{lessonsLearned} bài học</Text>
      </View>

      {/* Card: Bạn đã học liên tục */}
      <View style={styles.streakCard}>
        <View style={styles.leafContainer}>
          <Image
            source={normalizeImageSource(LeafIcon)}
            style={styles.leaf}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.streakLabel}>Bạn đã học liên tục</Text>
        <Text style={styles.streakValue}>{streakDays} ngày</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    alignItems: 'flex-start',
  },
  lessonsCard: {
    backgroundColor: '#BAD7A1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#6DAB1D', // 100% opacity
    minWidth: 200,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    }),
  },
  streakCard: {
    backgroundColor: '#F48FB180', // #F48FB1 với opacity 50%
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#F48FB1', // 100% opacity
    minWidth: 200,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
    }),
  },
  starsContainer: {
    position: 'absolute',
    top: -22,
    right: -20,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    zIndex: 1,
  },
  star: {
    width: 60,
    height: 60,
  },
  leafContainer: {
    position: 'absolute',
    top: -22,
    right: -20,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    zIndex: 1,
  },
  leaf: {
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 14,
    color: '#2E7D32',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  // Override label và value cho streak card
  streakLabel: {
    fontSize: 14,
    color: '#C2185B',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    textAlign: 'center',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#880E4F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

