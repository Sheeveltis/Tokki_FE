import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, Platform } from 'react-native'

/**
 * Component hiển thị chuỗi ngày học (Streak) của người dùng
 * Hỗ trợ đa nền tảng (Web & Mobile) với phong cách Cozy Garden cho Mobile
 */
export function UserStreak({ currentStreak = 0, maxStreak = 0, label = 'Chuỗi ngày học' }) {
  const isMobile = Platform.OS !== 'web'
  const fireAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, {
          toValue: isMobile ? 1.15 : 1.2,
          duration: isMobile ? 800 : 600,
          useNativeDriver: true,
        }),
        Animated.timing(fireAnim, {
          toValue: 1,
          duration: isMobile ? 800 : 600,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fireAnim, isMobile])

  if (isMobile) {
    // Layout tối ưu cho Mobile (Cozy Garden)
    return (
      <View style={styles.cardMobile}>
        <View style={styles.headerMobile}>
          <Text style={styles.labelMobile}>{label}</Text>
        </View>

        <View style={styles.mainContentMobile}>
          <View style={styles.streakDisplayMobile}>
            <Animated.View
              style={{
                transform: [{ scale: fireAnim }],
              }}
            >
              <Text style={styles.fireEmojiMobile}>🔥</Text>
            </Animated.View>
            <View style={styles.numberContainerMobile}>
              <Text style={styles.currentStreakNumberMobile}>{currentStreak}</Text>
              <Text style={styles.streakUnitMobile}>ngày</Text>
            </View>
          </View>

          <View style={styles.statsRowMobile}>
            <View style={styles.statBoxMobile}>
              <Text style={styles.statLabelMobile}>Kỷ lục hiện tại</Text>
              <View style={styles.statValueRowMobile}>
                <Text style={styles.statValueMobile}>{maxStreak}</Text>
                <Text style={styles.statUnitSmallMobile}>ngày</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footerMobile}>
          <View style={styles.motivationBannerMobile}>
            <Text style={styles.motivationTextMobile}>
              {currentStreak > 0
                ? `🌟 Tuyệt vời! Bạn đã duy trì được ${currentStreak} ngày liên tiếp.`
                : '🌱 Hãy bắt đầu bài học của ngày hôm nay!'}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Layout mặc định cho Web
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
  // Styles cho Web (giữ nguyên hoặc tinh chỉnh nhẹ)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
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
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
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

  // Styles cho Mobile (Cozy Garden)
  cardMobile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E3DC',
    width: '100%',
  },
  headerMobile: {
    marginBottom: 16,
  },
  labelMobile: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3D3D3D',
    fontFamily: 'Epilogue, sans-serif',
  },
  mainContentMobile: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 10,
  },
  streakDisplayMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFF9F2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE8D1',
  },
  fireEmojiMobile: {
    fontSize: 44,
  },
  numberContainerMobile: {
    alignItems: 'flex-start',
  },
  currentStreakNumberMobile: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B35',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 40,
  },
  streakUnitMobile: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A5B',
    fontFamily: 'Epilogue, sans-serif',
  },
  statsRowMobile: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statBoxMobile: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statLabelMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  statValueRowMobile: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValueMobile: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5C5C5C',
    fontFamily: 'Epilogue, sans-serif',
  },
  statUnitSmallMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  footerMobile: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F0',
  },
  motivationBannerMobile: {
    backgroundColor: '#F8FBF8',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF5EE',
  },
  motivationTextMobile: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A6B4A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 18,
  },
})

