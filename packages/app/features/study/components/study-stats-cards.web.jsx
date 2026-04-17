import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'
import { colors } from '@tokki/app/color'
import { normalizeImageSource } from '@tokki/app/features/study/api'

import FireIcon from 'assets/icon/icon-mainflow/fire.svg'

/**
 * StudyStatsCards: Component hiển thị card thống kê chuỗi học tập (streak)
 * @param {{
 *   lessonsLearned?: number
 *   streakDays?: number
 *   isCompletedToday?: boolean
 * }} props
 */
export function StudyStatsCards({ streakDays = 0, isCompletedToday = false }) {
  return (
    <View style={styles.container}>
      {/* Card: Chuỗi học tập */}
      <View style={[styles.streakCard, isCompletedToday && styles.streakCardActive]}>
        <View style={styles.fireContainer}>
          <View style={[!isCompletedToday ? styles.fireDark : styles.fireActive]}>
            <FireIcon width={120} height={120} />
          </View>
        </View>
        <Text style={[styles.streakLabel, isCompletedToday && styles.streakLabelActive]}>
          Chuỗi học tập
        </Text>
        <View style={styles.valueRow}>
          <Text style={[styles.streakValue, isCompletedToday && styles.streakValueActive]}>
            {streakDays}
          </Text>
          <Text style={[styles.streakUnit, isCompletedToday && styles.streakUnitActive]}>
            ngày
          </Text>
        </View>
        {!isCompletedToday && (
          <Text style={styles.hintText}>Học ngay để duy trì lửa!</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
  },
  streakCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.04)',
    }),
  },
  streakCardActive: {
    borderColor: '#FFF3E0',
    backgroundColor: '#FFF8F1',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(255, 152, 0, 0.12)',
    }),
  },
  fireContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  fireDark: {
    opacity: 0.1,
    ...(Platform.OS === 'web' && {
      filter: 'grayscale(1)',
    }),
  },
  fireActive: {
    opacity: 0.2,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#757575',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakLabelActive: {
    color: '#F57C00',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#424242',
    fontFamily: 'Epilogue, sans-serif',
  },
  streakValueActive: {
    color: '#E65100',
  },
  streakUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9E9E9E',
    fontFamily: 'Epilogue, sans-serif',
  },
  streakUnitActive: {
    color: '#FB8C00',
  },
  hintText: {
    fontSize: 11,
    color: '#9E9E9E',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 8,
    fontStyle: 'italic',
  },
})

