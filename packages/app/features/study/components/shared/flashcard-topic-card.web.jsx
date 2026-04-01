import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image as RNImage, Platform } from 'react-native'
import { StudyIcon } from '../study-icon.web'
import { normalizeImageSource } from '../../api'
import CompleteStamp from '../../../../../assets/icon/decor/complete-stamp.png'

/**
 * FlashcardTopicCard: hiển thị một chủ đề flashcard
 */
export function FlashcardTopicCard({
  icon,
  title,
  subtitle,
  progress = 0,
  vocabularyCount,
  onPress,
}) {
  const [hovered, setHovered] = useState(false)
  const isComplete = progress >= 100

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        (pressed || hovered) && styles.cardActive,
      ]}
    >
      <View style={styles.cardInner}>
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>
            <StudyIcon
              source={icon}
              width={80}
              height={80}
            />
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {vocabularyCount && (
              <View style={styles.vocabBadge}>
                <Text style={styles.vocabBadgeText}>{vocabularyCount} từ</Text>
              </View>
            )}
          </View>
          
          <Text 
            style={styles.subtitle}
            numberOfLines={2}
          >
            {subtitle}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tiến độ học tập</Text>
              <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(100, Math.max(0, progress))}%` },
                  isComplete && styles.progressBarComplete
                ]} 
              />
            </View>
          </View>
        </View>

        {isComplete && (
          <View style={styles.completeOverlay}>
            <RNImage
              source={normalizeImageSource(CompleteStamp)}
              style={styles.stampImage}
              resizeMode="contain"
            />
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    }),
  },
  cardActive: {
    transform: [{ translateY: -6 }],
    borderColor: '#F1BE4B50',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 24px rgba(241, 190, 75, 0.12)',
    }),
  },
  cardInner: {
    flexDirection: 'row',
    padding: 24,
    gap: 20,
    alignItems: 'center',
    position: 'relative',
  },
  leftSection: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FEF7E6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  contentSection: {
    flex: 1,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  vocabBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F1BE4B15',
    borderRadius: 8,
  },
  vocabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D9A635',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    minHeight: 40,
  },
  progressSection: {
    marginTop: 4,
    gap: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 4,
    ...(Platform.OS === 'web' && {
      transition: 'width 0.5s ease-out',
    }),
  },
  progressBarComplete: {
    backgroundColor: '#4CAF50',
  },
  completeOverlay: {
    position: 'absolute',
    right: 12,
    top: -10,
    width: 60,
    height: 60,
    opacity: 0.8,
    transform: [{ rotate: '15deg' }],
    pointerEvents: 'none',
  },
  stampImage: {
    width: '100%',
    height: '100%',
  },
})


