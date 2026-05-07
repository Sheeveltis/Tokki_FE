import React, { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

export function StreakInfo({ currentStreak = 0, label = 'Chuỗi ngày học' }) {
  const fireAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fireAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fireAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [fireAnim])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quá trình học tập</Text>
      
      <View style={styles.content}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>{label}</Text>
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
          <Text style={styles.fireIcon}>🔥</Text>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 15,
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
    gap: 2,
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  streakUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1BE4B',
  },
  fireIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF9F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.2)',
  },
  fireIcon: {
    fontSize: 28,
  },
})
