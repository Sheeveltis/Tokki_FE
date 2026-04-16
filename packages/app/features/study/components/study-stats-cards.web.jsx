import React from 'react'
import { View, Text, StyleSheet, Image, Platform } from 'react-native'
import { colors } from '@tokki/app/color'
import { normalizeImageSource } from '@tokki/app/features/study/api'

import StarIcon from 'assets/icon/decor/19.png'
import LeafIcon from 'assets/icon/decor/18.png'

/**
 * StudyStatsCards: Component hiển thị 2 card thống kê học tập
 * @param {{
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function StudyStatsCards({ streakDays = 30 }) {
  return (
    <View style={styles.container}>
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
    borderColor: '#FCE4EC',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(194, 24, 91, 0.05)',
    }),
  },
  leafContainer: {
    position: 'absolute',
    top: 12,
    right: 20,
    zIndex: 1,
  },
  leaf: {
    width: 48,
    height: 48,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F06292',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#C2185B',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 34,
  },
})

