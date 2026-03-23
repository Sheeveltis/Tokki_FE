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
  isCompleted = false,
  tone = 'primary',
  variant = 'default', // 'default' | 'header'
}) {
  const cardBaseStyle = isCompleted ? styles.completedCard : styles.incompleteCard
  const actionButtonStyle = isCompleted ? styles.completedActionButton : styles.incompleteActionButton
  const iconCircleStyle = isCompleted ? styles.completedIconCircle : styles.incompleteIconCircle
  const [isHovered, setIsHovered] = useState(false)

  // Header variant: không hover xám, không onPress riêng (để click pass cho DayItem)
  if (variant === 'header') {
    return (
      <View style={[styles.container, cardBaseStyle, styles.headerContainer]}>
        <View style={styles.left}>
          <View style={[styles.iconCircle, iconCircleStyle]}>{renderIcon(icon)}</View>
          <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {isCompleted && (
              <View style={styles.checkWrapper}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </View>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={[styles.actionButton, actionButtonStyle, styles.headerActionButton]}>
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
        cardBaseStyle,
        styles.defaultContainer,
        isHovered && styles.containerHovered,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.left}>
        <View style={[styles.iconCircle, iconCircleStyle]}>{renderIcon(icon)}</View>
        <View style={styles.texts}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            {isCompleted && (
              <View style={styles.checkWrapper}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </View>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={[styles.actionButton, actionButtonStyle]}>
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
  containerPressed: {
    transform: [{ scale: 0.995 }],
  },
  defaultContainer: {
    borderWidth: 1,
  },
  containerHovered: {
    backgroundColor: '#F9F9F9',
    transform: [{ translateY: -1 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }),
  },
  completedCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  incompleteCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EAEAEA',
  },
  completedActionButton: {
    backgroundColor: '#C8E6C9',
  },
  incompleteActionButton: {
    backgroundColor: '#F5F5F5',
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
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  completedIconCircle: {
    backgroundColor: '#66BB6A', // Lighter green for check/icon area
  },
  incompleteIconCircle: {
    backgroundColor: '#F4A950', // Original amber for pending
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  checkWrapper: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 12,
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

