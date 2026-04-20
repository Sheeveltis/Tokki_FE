import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform, Animated } from 'react-native'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import BackgroundPattern from 'assets/background1.png'

import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'

/**
 * TopikBanner: Banner hiện đại với thiết kế cao cấp
 */
export function TopikBanner({
  title,
  levelId,
  backgroundPattern = BackgroundPattern,
  onPress,
  aimLevel,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current

  const isUserTargetLevel = levelId && aimLevel && Number(levelId) === Number(aimLevel)
  const displayTitle = title || (levelId ? `LỘ TRÌNH HỌC TOPIK - LEVEL ${levelId}` : 'LỘ TRÌNH HỌC TẬP')

  // Xử lý tiêu đề để nhấn mạnh chữ LỘ TRÌNH
  const renderTitle = () => {
    const baseColor = '#1A1A1A'
    const highlightColor = '#C2185B' // Màu đỏ hồng thanh lịch của streak

    if (title === 'HỌC CHỮ CÁI' || !displayTitle.includes('LỘ TRÌNH')) {
      return <Text style={[styles.title, { color: baseColor }]}>{displayTitle}</Text>
    }

    const parts = displayTitle.split('LỘ TRÌNH')
    return (
      <Text style={[styles.title, { color: baseColor }]}>
        <Text style={{ color: highlightColor, fontWeight: '950' }}>LỘ TRÌNH</Text>
        {parts[1]}
      </Text>
    )
  }

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
      <View style={styles.bgContainer}>
        {backgroundPattern && (
          <Animated.Image
            source={normalizeImageSource(backgroundPattern)}
            style={[
              styles.pattern,
              {
                opacity: isHovered ? 0.08 : 0.02,
                transform: [{ translateX }, { scale: 1.5 }],
              },
            ]}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.leftSection}>
            <View style={styles.textContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {renderTitle()}
                {isUserTargetLevel && (
                  <View style={styles.targetBadge}>
                    <Text style={styles.targetBadgeText}>MỤC TIÊU</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>{subtitle}</Text>
              
              {/* Progress Bar */}
              {isUserTargetLevel && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '65%' }]} />
                  </View>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressText}>Tiến độ: 65%</Text>
                    <Text style={styles.progressText}>Mục tiêu: Level 3</Text>
                  </View>
                </View>
              )}
            </View>
        </View>

        <View style={[styles.actionBadge, isHovered && styles.actionBadgeActive]}>
          <Text style={[styles.actionText, isHovered && styles.actionTextActive]}>HỌC NGAY</Text>
          <View style={styles.arrowWrapper}>
            <ArrowIcon
              width={14}
              height={14}
              fill={isHovered ? '#C2185B' : '#999'}
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
    borderColor: 'rgba(240, 240, 245, 0.8)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
      cursor: 'pointer',
      transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  bannerActive: {
    borderColor: '#C2185B20',
    transform: [{ scale: 0.99 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 50px rgba(194, 24, 91, 0.08)',
    }),
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    backgroundColor: '#FFFFFF',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.02,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    zIndex: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  textContainer: {
    gap: 8,
    flex: 1, // Để chiếm không gian và cho phép progress bar giãn ra
  },
  title: {
    fontSize: 24,
    fontWeight: '950',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 12,
    width: '100%',
    maxWidth: 300,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F0F0F5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#C2185B', // Màu đỏ hồng đồng bộ với action badge
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionBadge: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 100,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...(Platform.OS === 'web' && { 
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    }),
  },
  actionBadgeActive: {
    backgroundColor: '#C2185B',
    transform: [{ scale: 1.05 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 25px rgba(194, 24, 91, 0.3)' }),
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
  arrowWrapper: {
    marginLeft: 0,
  },
  targetBadge: {
    backgroundColor: '#2E7D32', // Nền xanh đậm
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B5E20',
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF', // Chữ trắng trên nền xanh đậm cho độ tương phản cao
    letterSpacing: 0.5,
  },
});
