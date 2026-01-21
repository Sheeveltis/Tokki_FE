import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../api'

/**
 * FlashcardTopicCard: hiển thị một chủ đề flashcard
 */
export function FlashcardTopicCard({
  icon,
  title,
  subtitle,
  badgeText = '펀',
  highlight,
  muted,
  onPress,
  compact = false,
  showBadge = true,
}) {
  const [hovered, setHovered] = useState(false)
  const shouldShowBadge = showBadge && (!compact || Platform.OS !== 'web')

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        highlight && styles.cardHighlight,
        muted && styles.cardMuted,
        (pressed || hovered) && styles.cardActive,
      ]}
    >
      <View style={[styles.left, compact && styles.leftCompact]}>
        <Image
          source={normalizeImageSource(icon)}
          style={[styles.avatar, compact && styles.avatarCompact]}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.divider, compact && styles.dividerCompact]} />
      <View style={[styles.middle, compact && styles.middleCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</Text>
      </View>
      {shouldShowBadge ? (
        <View style={[styles.right, compact && styles.rightCompact]}>
          <View style={[styles.badge, compact && styles.badgeCompact]}>
            <Text style={[styles.badgeText, compact && styles.badgeTextCompact]}>
              {badgeText}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    backgroundColor: '#FDEEB9',
    borderRadius: 80,
    shadowColor: '#F1BE4B',
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 6 },
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, box-shadow, background-color, border-color',
      transitionDuration: '150ms',
      cursor: 'pointer',
    }),
  },
  cardHighlight: {
    backgroundColor: '#FDEEB9',
    borderColor: '#F1BE4B',
  },
  cardCompact: {
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    paddingHorizontal: Platform.OS === 'web' ? 50 : 16,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 4 },
    backgroundColor: '#F1BE4B',
    ...(Platform.OS !== 'web' && {
      marginBottom: 12,
    }),
  },
  cardMuted: {
    opacity: 0.85,
  },
  cardActive: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.22,
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  left: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftCompact: {
    width: Platform.OS === 'web' ? 60 : 50,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  avatarCompact: {
    width: Platform.OS === 'web' ? 48 : 40,
    height: Platform.OS === 'web' ? 48 : 40,
  },
  divider: {
    width: 2,
    height: 80,
    backgroundColor: '#F1BE4B',
    marginHorizontal: 16,
  },
  dividerCompact: {
    height: Platform.OS === 'web' ? 50 : 40,
    marginHorizontal: Platform.OS === 'web' ? 12 : 8,
  },
  middle: {
    flex: 1,
    gap: 6,
  },
  middleCompact: {
    gap: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  titleCompact: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitleCompact: {
    fontSize: Platform.OS === 'web' ? 13 : 11,
  },
  right: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightCompact: {
    width: 60,
  },
  badge: {
    minWidth: 50,
    height: 50,
    paddingHorizontal: 6,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#23ac38',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  badgeCompact: {
    minWidth: 56,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#23ac38',
    fontFamily: 'Epilogue, sans-serif',
  },
  badgeTextCompact: {
    fontSize: 12,
    textAlign: 'center',
  },
})


