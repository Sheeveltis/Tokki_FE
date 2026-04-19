import React, { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform } from 'react-native'
import { CheckOutlined, CheckCircleFilled } from '@ant-design/icons'

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
  const isPrimary = tone === 'primary' && !isCompleted
  const isSecondary = tone === 'secondary' && !isCompleted
  const isTrial = tone === 'trial' && !isCompleted

  const cardBaseStyle = isCompleted ? styles.completedCard : styles.incompleteCard

  const actionButtonStyle = isCompleted
    ? styles.completedActionButton
    : isPrimary
      ? styles.primaryActionButton
      : isSecondary
        ? styles.secondaryActionButton
        : isTrial
          ? styles.trialActionButton
          : styles.incompleteActionButton

  const actionLabelStyle = isCompleted
    ? styles.completedActionLabel
    : isPrimary
      ? styles.primaryActionLabel
      : isSecondary
        ? styles.secondaryActionLabel
        : isTrial
          ? styles.trialActionLabel
          : null

  const titleStyle = null
  const subtitleStyle = null

  const iconCircleStyle = isCompleted
    ? styles.completedIconCircle
    : styles.incompleteIconCircle

  const [isHovered, setIsHovered] = useState(false)

  // Header variant: không hover xám, không onPress riêng (để click pass cho DayItem)
  if (variant === 'header') {
    return (
      <View style={[styles.container, cardBaseStyle, styles.headerContainer]}>
        <View style={styles.left}>
          <View style={[styles.iconCircle, iconCircleStyle]}>{renderIcon(icon)}</View>
          <View style={styles.texts}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, isHovered && styles.titleHovered, titleStyle]} numberOfLines={2}>{title}</Text>
              {isCompleted && (
                <View style={styles.checkWrapper}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </View>
            {!!subtitle && <Text style={[styles.subtitle, isHovered && styles.subtitleHovered, subtitleStyle]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={[styles.actionButton, actionButtonStyle, styles.headerActionButton]}>
          {isCompleted ? (
            <CheckOutlined style={{ color: '#2F855A', fontSize: 18 }} />
          ) : (
            <Text style={[styles.actionLabel, actionLabelStyle]}>{actionLabel}</Text>
          )}
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
            <Text style={[styles.title, titleStyle]} numberOfLines={2}>{title}</Text>
            {tone === 'trial' && !isCompleted && (
              <View style={styles.importantBadge}>
                <Text style={styles.importantBadgeText}>Quan trọng</Text>
              </View>
            )}
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Đã hoàn thành</Text>
              </View>
            )}
          </View>
          {!!subtitle && <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={[styles.actionButton, actionButtonStyle, isHovered && styles.actionButtonHovered]}>
        {isCompleted ? (
          <CheckCircleFilled style={{ color: '#48BB78', fontSize: 24 }} />
        ) : (
          <Text style={[styles.actionLabel, actionLabelStyle, isHovered && styles.actionLabelHovered]}>{actionLabel}</Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  headerContainer: {
    minHeight: 72,
  },
  containerPressed: {
    transform: [{ scale: 0.98 }],
  },
  defaultContainer: {
    borderWidth: 1,
  },
  containerHovered: {
    backgroundColor: '#FFFCF8',
    borderColor: '#F4A950',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(244,169,80,0.08)',
    }),
  },
  actionButtonHovered: {
    transform: [{ scale: 1.05 }],
  },
  actionLabelHovered: {
    color: undefined,
  },
  primaryActionButton: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFE8CC',
    borderWidth: 1,
  },
  primaryActionLabel: {
    color: '#D38E3F',
  },
  secondaryActionButton: {
    backgroundColor: '#F0FFF4',
    borderColor: '#C6F6D5',
    borderWidth: 1,
  },
  secondaryActionLabel: {
    color: '#38A169',
  },
  trialActionButton: {
    backgroundColor: '#F0F7FF',
    borderColor: '#B9E6FE',
    borderWidth: 1,
  },
  trialActionLabel: {
    color: '#007AFF',
  },
  importantBadge: {
    backgroundColor: '#FF4D4F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  importantBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completedCard: {
    backgroundColor: '#F9FFF9',
    borderColor: '#C2E9C2',
    borderWidth: 1,
  },
  incompleteCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }),
  },
  completedActionButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
    minHeight: 36,
    justifyContent: 'center',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  completedBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  incompleteActionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EEEEEE',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  completedIconCircle: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1.5,
    borderColor: '#48BB78',
  },
  incompleteIconCircle: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  iconImage: {
    width: 24,
    height: 24,
  },
  texts: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  checkWrapper: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
  },
  titleHovered: {
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitleHovered: {
    color: '#666',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  headerActionButton: {
    marginLeft: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  completedActionLabel: {
    color: '#2F855A',
  },
})


