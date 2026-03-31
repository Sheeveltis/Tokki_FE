import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform, Animated } from 'react-native'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import BunnyWithCarrot from 'assets/bunny/14.png'
import BackgroundPattern from 'assets/background1.png'

import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'

/**
 * TopikBanner: Banner hiện đại với thiết kế cao cấp
 */
export function TopikBanner({
  title,
  levelId,
  bunnyImage = BunnyWithCarrot,
  backgroundColor = '#F4A950',
  borderColor = '#F0F0F0',
  backgroundPattern = BackgroundPattern,
  onPress,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current

  const displayTitle = title || (levelId ? `LỘ TRÌNH HỌC TOPIK - LEVEL ${levelId}` : 'LỘ TRÌNH HỌC TẬP')
  const subtitle = levelId ? `Cấp độ ${levelId} • Kế hoạch học tập tối ưu` : 'Khám phá kiến thức mới mỗi ngày'

  useEffect(() => {
    if (isHovered) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, { toValue: 20, duration: 3000, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 3000, useNativeDriver: true }),
        ])
      ).start()
    } else {
      translateX.stopAnimation()
      Animated.timing(translateX, { toValue: 0, duration: 500, useNativeDriver: true }).start()
    }
  }, [isHovered])

  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        (pressed || isHovered) && styles.bannerActive,
      ]}
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      <View style={[styles.bgContainer, { backgroundColor: isHovered ? backgroundColor : '#FFFFFF' }]}>
        {backgroundPattern && (
          <Animated.Image
            source={normalizeImageSource(backgroundPattern)}
            style={[
              styles.pattern,
              {
                opacity: isHovered ? 0.05 : 0.03,
                transform: [{ translateX }, { scale: 2 }],
              },
            ]}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Image
            source={normalizeImageSource(bunnyImage)}
            style={styles.bunny}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: isHovered ? '#FFFFFF' : '#1A1A1A' }]}>{displayTitle}</Text>
            <Text style={[styles.subtitle, { color: isHovered ? 'rgba(255,255,255,0.6)' : '#999' }]}>{subtitle}</Text>
          </View>
        </View>

        <View style={[styles.actionBadge, isHovered && styles.actionBadgeActive]}>
          <Text style={[styles.actionText, isHovered && styles.actionTextActive]}>HỌC NGAY</Text>
          <View style={styles.arrowWrapper}>
            <ArrowIcon 
              width={14} 
              height={14} 
              fill={isHovered ? '#FFFFFF' : '#999'} 
            />
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  },
  bannerActive: {
    borderColor: '#F4A950',
    transform: [{ scale: 0.995 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 60px rgba(0,0,0,0.08)',
    }),
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    ...(Platform.OS === 'web' && { transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }),
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    width: '200%',
    height: '200%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  bunny: {
    width: 80,
    height: 80,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionBadge: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...(Platform.OS === 'web' && { transition: 'all 0.3s ease' }),
  },
  actionBadgeActive: {
    backgroundColor: '#F4A950',
    borderColor: '#F4A950',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 20px rgba(244,169,80,0.2)' }),
  },
  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
  arrowWrapper: {
    marginLeft: 2,
  },
})
