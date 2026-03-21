import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform } from 'react-native'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src?.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return null
}

const renderIcon = (icon) => {
  if (!icon) return null

  if (typeof icon === 'function') {
    const SvgIcon = icon
    return <SvgIcon width={24} height={24} />
  }

  if (typeof icon === 'object' && typeof icon.default === 'function') {
    const SvgIcon = icon.default
    return <SvgIcon width={24} height={24} />
  }

  const source = normalizeImageSource(icon)
  if (!source) return null

  return <Image source={source} style={styles.iconImage} resizeMode="contain" />
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
      <View style={[styles.container, toneStyles, styles.headerContainer]}>
        <View style={styles.left}>
          <View style={styles.iconCircle}>{renderIcon(icon)}</View>
          <View style={styles.texts}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={[styles.actionButton, styles.headerActionButton]}>
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
        styles.defaultContainer,
        isHovered && styles.containerHovered,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.iconCircle}>{renderIcon(icon)}</View>
        <View style={styles.texts}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
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
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow, background-color',
      transitionDuration: '160ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  headerContainer: {
    minHeight: 64,
  },
  defaultContainer: {
    borderWidth: 1,
    borderColor: '#F3D8AA',
  },
  containerHovered: {
    transform: [{ translateY: -1 }],
    backgroundColor: '#FFF3E3',
  },
  containerPressed: {
    transform: [{ scale: 0.995 }],
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
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F4A950',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  iconText: {
    fontSize: 18,
  },
  texts: {
    flex: 1,
    gap: 1,
    minWidth: 0,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFCF6C',
    flexShrink: 0,
  },
  headerActionButton: {
    marginLeft: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
})

