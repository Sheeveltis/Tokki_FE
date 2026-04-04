import React, { useEffect, useState, useRef } from 'react'
import { Platform, Animated } from 'react-native'
import { createPortal } from 'react-dom'

// ─── WEB: Pure HTML/CSS notification via React DOM portal ─────────────────────
function XpNotificationWeb({ xp, visible, isLevelUp, newLevel }) {
  const [show, setShow] = useState(false)
  const [animating, setAnimating] = useState(false)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    if (visible) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setShow(true)
      setAnimating(true)
    } else if (show) {
      // Trigger slide-out, then unmount after animation
      setAnimating(false)
      hideTimerRef.current = setTimeout(() => setShow(false), 400)
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [visible])

  if (!show || typeof document === 'undefined') return null

  const containerStyle = {
    position: 'fixed',
    bottom: 40,
    left: 30,
    zIndex: 2147483647,
    fontFamily: 'Epilogue, Inter, sans-serif',
    pointerEvents: 'none',
    transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    opacity: animating ? 1 : 0,
    transform: animating ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
  }

  const bubbleStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: '10px 20px 10px 10px',
    minWidth: 260,
    boxShadow: '0 8px 24px rgba(137, 164, 85, 0.25), 0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #E8F1D5',
    gap: 12,
    position: 'relative',
  }

  const badgeStyle = {
    backgroundColor: '#FFD700',
    borderRadius: 14,
    padding: '8px 14px',
    border: '2px solid #C6A700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return createPortal(
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        {/* XP Badge */}
        <div style={badgeStyle}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#5C430D' }}>
            +{xp || 10} XP
          </span>
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>
            Chúc mừng! 🎉
          </span>
          <span style={{ fontSize: 12, color: '#666', lineHeight: 1.3 }}>
            Bạn đã nhận được kinh nghiệm
          </span>
        </div>

        {/* Level Up badge */}
        {isLevelUp && newLevel ? (
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: 12,
              backgroundColor: '#FF6B6B',
              borderRadius: 10,
              padding: '3px 10px',
              border: '2px solid #fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              LÊN CẤP {newLevel}!
            </span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

// ─── MOBILE: React Native Animated notification ───────────────────────────────
function XpNotificationMobile({ xp, visible, isLevelUp, newLevel }) {
  const { View, Text, StyleSheet } = require('react-native')
  const [show, setShow] = useState(false)
  const anim = useRef(new Animated.Value(0)).current
  const levelUpAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      setShow(true)
      levelUpAnim.setValue(0)
      anim.setValue(0)
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: false,
        damping: 16,
        stiffness: 130,
      }).start()
      if (isLevelUp) {
        Animated.sequence([
          Animated.delay(300),
          Animated.spring(levelUpAnim, {
            toValue: 1,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }),
        ]).start()
      }
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) setShow(false)
      })
    }
  }, [visible])

  if (!show) return null

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      zIndex: 9999,
      elevation: 20,
    },
    bubble: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 12,
      paddingRight: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      shadowColor: '#89A455',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: '#E8F1D5',
      minWidth: 240,
    },
    badge: {
      backgroundColor: '#FFD700',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 2,
      borderColor: '#C6A700',
    },
    badgeText: { fontSize: 16, fontWeight: '800', color: '#5C430D' },
    title: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
    sub: { fontSize: 12, color: '#666' },
    levelUpBadge: {
      position: 'absolute',
      top: -12,
      right: 12,
      backgroundColor: '#FF6B6B',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderWidth: 2,
      borderColor: '#fff',
      elevation: 4,
    },
    levelUpText: { fontSize: 11, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  })

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { opacity: anim, transform: [{ translateY }, { scale }] },
      ]}
    >
      <View style={styles.bubble}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{xp || 10} XP</Text>
        </View>
        <View>
          <Text style={styles.title}>Chúc mừng! 🎉</Text>
          <Text style={styles.sub}>Bạn đã nhận được kinh nghiệm</Text>
        </View>
        {isLevelUp && newLevel ? (
          <Animated.View
            style={[styles.levelUpBadge, { transform: [{ scale: levelUpAnim }], opacity: levelUpAnim }]}
          >
            <Text style={styles.levelUpText}>LÊN CẤP {newLevel}!</Text>
          </Animated.View>
        ) : null}
      </View>
    </Animated.View>
  )
}

// ─── Unified export ───────────────────────────────────────────────────────────
export const XpNotification = (props) => {
  if (Platform.OS === 'web') {
    return <XpNotificationWeb {...props} />
  }
  return <XpNotificationMobile {...props} />
}
