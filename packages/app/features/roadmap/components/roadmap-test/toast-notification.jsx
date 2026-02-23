import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Animated, Platform } from 'react-native'

export function ToastNotification({ visible, message, type = 'success', onHide, duration = 3000 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-50)).current
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
      // Reset animations
      fadeAnim.setValue(0)
      slideAnim.setValue(-50)
      
      // Fade in và slide down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Tự động ẩn sau duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    } else if (shouldRender) {
      hideToast()
    }
  }, [visible])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShouldRender(false)
      if (onHide) {
        onHide()
      }
    })
  }

  if (!shouldRender) return null

  const backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: '90%',
    gap: 12,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    }),
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})
