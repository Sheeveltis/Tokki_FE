import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform } from 'react-native'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function RoadmapLearningLessonCard({
  icon,
  title,
  subtitle,
  actionLabel,
  onPress,
  tone = 'primary',
  variant = 'default', // 'default' | 'header'
}) {
  const toneStyles = tone === 'secondary' ? styles.secondaryCard : styles.primaryCard
  const [isHovered, setIsHovered] = useState(false)

  // Header variant: không hover xám, không onPress riêng (để click pass cho DayItem)
  if (variant === 'header') {
    return (
      <View style={[styles.container, toneStyles]}>
        <View style={styles.left}>
          <View style={styles.iconCircle}>
            <Image
              source={normalizeImageSource(icon)}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.texts}>
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.actionButton}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </View>
      </View>
    )
  }

  // Default variant: dùng hover xám và onPress riêng (Hướng dẫn / Luyện tập / Đánh giá)
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
      style={({ pressed }) => [
        styles.container,
        toneStyles,
        isHovered && styles.containerHovered,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>
          <Image
            source={normalizeImageSource(icon)}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.actionButton}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow, background-color',
      transitionDuration: '160ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  containerHovered: {
    transform: [{ translateY: -1 }],
    backgroundColor: '#F0F0F0',
  },
  containerPressed: {
    transform: [{ scale: 0.99 }],
  },
  primaryCard: {
    backgroundColor: '#FFE7A5',
  },
  secondaryCard: {
    backgroundColor: '#FFF8F0',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4A950',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: '#666666',
  },
  iconText: {
    fontSize: 18,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 13,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFCF6C',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
})

