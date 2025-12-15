import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform, Animated } from 'react-native'
import { normalizeImageSource } from '../../api'

import BunnyWithCarrot from '../../../../../assets/bunny/14.png'
import BackgroundPattern from '../../../../../assets/background1.png'

/**
 * TopikBanner: Banner có thể tái sử dụng với title, hình ảnh và màu sắc tùy chỉnh
 * @param {{
 *   title: string - Text hiển thị ở giữa banner
 *   levelId?: number - Level ID (dùng để tạo title mặc định nếu không có title)
 *   bunnyImage?: any - Hình ảnh thỏ bên trái (mặc định: BunnyWithCarrot)
 *   backgroundColor?: string - Màu nền banner khi hover/click (mặc định: '#F4900C')
 *   borderColor?: string - Màu viền banner (mặc định: '#FF6B1A')
 *   backgroundPattern?: any - Pattern background (mặc định: BackgroundPattern)
 *   onPress?: () => void - Callback khi click vào banner
 * }} props
 */
export function TopikBanner({
  title,
  levelId,
  bunnyImage = BunnyWithCarrot,
  backgroundColor = '#F4900C',
  borderColor = '#FF6B1A',
  backgroundPattern = BackgroundPattern,
  onPress,
}) {
  const [isHovered, setIsHovered] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current

  // Tự động tạo title nếu không có title nhưng có levelId
  const displayTitle = title || (levelId ? `LỘ TRÌNH HỌC TOPIK - LEVEL ${levelId}` : '')

  // Animation di chuyển pattern khi hover
  useEffect(() => {
    if (isHovered) {
      // Tạo animation di chuyển liên tục
      const animationX = Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 50,
            duration: 5000, 
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: -50,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: true,
          }),
        ])
      )

      const animationY = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 30,
            duration: 1500, // Giảm từ 4000ms xuống 1500ms để tăng tốc độ
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -30,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      )

      Animated.parallel([animationX, animationY]).start()
    } else {
      // Dừng animation và reset về vị trí ban đầu
      translateX.stopAnimation()
      translateY.stopAnimation()
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isHovered, translateX, translateY])

  return (
    <Pressable
      style={({ pressed }) => [
        styles.banner,
        { borderColor },
        (pressed || isHovered) && styles.bannerPressed,
      ]}
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      {({ pressed }) => {
        // Màu sắc động: mặc định trắng/đen, khi hover/click thì cam/trắng
        const isActive = pressed || isHovered
        const dynamicBackgroundColor = isActive ? backgroundColor : '#FFFFFF'
        const dynamicTextColor = isActive ? '#FFFFFF' : '#1F1F1F'
        const dynamicArrowColor = isActive ? '#FFFFFF' : '#1F1F1F'
        const patternOpacity = 0.2 // Luôn giữ opacity 0.2

        return (
          <>
            {/* Layers: color + pattern */}
            <View style={[styles.colorLayer, { backgroundColor: dynamicBackgroundColor }]} />
            {backgroundPattern && (
              <Animated.Image
                source={normalizeImageSource(backgroundPattern)}
                style={[
                  styles.patternLayer,
                  {
                    opacity: patternOpacity,
                    transform: [
                      { scale: 4}, // Phóng to 1.5x để khi di chuyển không bị ra khỏi khung
                      { translateX },
                    ],
                  },
                ]}
                resizeMode="repeat"
              />
            )}

            <View style={styles.content}>
              {/* Thỏ bên trái */}
              {bunnyImage && (
                <View style={styles.leftSection}>
                  <Image
                    source={normalizeImageSource(bunnyImage)}
                    style={styles.bunny}
                    resizeMode="contain"
                  />
                </View>
              )}

              {/* Text ở giữa */}
              <View style={styles.centerSection}>
                <Text style={[styles.bannerText, { color: dynamicTextColor }]}>{displayTitle}</Text>
              </View>

              {/* Arrow bên phải */}
              <View style={styles.rightSection}>
                <Text style={[styles.arrow, { color: dynamicArrowColor }]}>→</Text>
              </View>
            </View>
          </>
        )
      }}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#FF6B1A',
    shadowColor: '#00000020',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, shadowOpacity',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  bannerPressed: {
    transform: [{ scale: 0.98 }],
  },
  colorLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'background-color',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  patternLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    ...(Platform.OS === 'web' && {
      transitionProperty: 'opacity',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    justifyContent: 'flex-start',
  },
  bunny: {
    width: 80,
    height: 80,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'color',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  rightSection: {
    width: 120,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 32,
    fontWeight: '700',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'color',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
})


