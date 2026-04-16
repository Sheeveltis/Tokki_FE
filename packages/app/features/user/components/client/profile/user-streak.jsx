import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View, Platform } from 'react-native'
import { FireFilled } from '@ant-design/icons'

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

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Quá trình học tập</Text>
      
      <View style={styles.content}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Chuỗi ngày học</Text>
          <View style={styles.streakValueContainer}>
            <Text style={styles.streakValue}>{currentStreak}</Text>
            <Text style={styles.streakUnit}>ngày</Text>
          </View>
        </View>
        
        <Animated.View
          style={[
            styles.fireIconContainer,
            { transform: [{ scale: fireAnim }] }
          ]}
        >
          {Platform.OS === 'web' ? (
            <FireFilled style={{ fontSize: 32, color: '#F1BE4B' }} />
          ) : (
            <Text style={styles.fireIcon}>🔥</Text>
          )}
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Styles cho Web (giữ nguyên hoặc tinh chỉnh nhẹ)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    height: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakInfo: {
    gap: 4,
  },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  streakUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  fireIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.2)',
  },
  fireIcon: {
    fontSize: 32,
  },
  footer: {
    gap: 8,
  },
  bestStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  bestLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  bestValue: {
    fontSize: 12,
    color: '#20130A',
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  hintText: {
    fontSize: 11,
    color: '#A0A0A0',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
})

