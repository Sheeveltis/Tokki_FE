import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

/**
 * Component hiển thị chuỗi ngày học (Streak) của người dùng
 * @param {Object} props
 * @param {number} props.currentStreak - Số ngày streak hiện tại
 * @param {number} props.maxStreak - Số ngày streak tối đa đã đạt được
 * @param {string} props.label - Label hiển thị (mặc định "Chuỗi ngày học")
 */
export function UserStreak({ currentStreak = 0, maxStreak = 0, label = 'Chuỗi ngày học' }) {
  const fireAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // Animation nhấp nháy cho icon lửa
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fireAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fireAnim])

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.streakBadge}>
          <Animated.View
            style={{
              transform: [{ scale: fireAnim }],
            }}
          >
            <Text style={styles.fireEmoji}>🔥</Text>
          </Animated.View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Streak hiện tại</Text>
          <View style={styles.statValueContainer}>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statUnit}>ngày</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Kỷ lục</Text>
          <View style={styles.statValueContainer}>
            <Text style={styles.statValue}>{maxStreak}</Text>
            <Text style={styles.statUnit}>ngày</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.motivationText}>
          {currentStreak > 0
            ? `🔥 Bạn đã học liên tục ${currentStreak} ngày! Tiếp tục phát huy nhé!`
            : '💪 Bắt đầu chuỗi ngày học của bạn ngay hôm nay!'}
        </Text>
        {maxStreak > currentStreak && (
          <Text style={styles.recordText}>
            🏆 Kỷ lục của bạn: {maxStreak} ngày
          </Text>
        )}
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
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
    minWidth: 280,
    height: '100%',
  },
  header: {
    gap: 8,
  },
  titleRow: {
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFDCAA',
  },
  fireEmoji: {
    fontSize: 18,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF6B35',
    fontFamily: 'Epilogue, sans-serif',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B35',
    fontFamily: 'Epilogue, sans-serif',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  motivationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  recordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginTop: 4,
  },
})

