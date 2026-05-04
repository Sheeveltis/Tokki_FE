import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { renderHtmlText } from './PronunciationFeedbackText'
import SoundIcon from '../../../../assets/icon/icon-mainflow/sound.svg'

/**
 * PronunciationRuleCard: Hiển thị một quy tắc phát âm dưới dạng card
 * Design theo mẫu của người dùng (Korean title, Vietnamese subtitle, Progress bar)
 */
export function PronunciationRuleCard({ rule, onPress }) {
  // Giả định title chứa cả tiếng Hàn và tiếng Việt cách nhau bởi dấu gạch ngang hoặc xuống dòng
  // Nếu không tách được, cứ hiển thị title (Korean) và description (Vietnamese)
  const title = rule.title || 'Quy tắc'
  const subtitle = rule.description || 'Pronunciation Rule'
  const progress = rule.progressPercent || 0 // Sử dụng progressPercent từ API

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.koreanTitle} numberOfLines={1}>
            {renderHtmlText(title, styles.koreanTitle, styles.boldTitle)}
          </Text>
          <Text style={styles.vietnameseSubtitle} numberOfLines={1}>
            {renderHtmlText(subtitle, styles.vietnameseSubtitle, styles.boldSubtitle)}
          </Text>
        </View>

        <View style={styles.iconBox}>
          <SoundIcon width={24} height={24} fill="#8B4513" />
        </View>
      </View>

      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>TIẾN ĐỘ HOÀN THÀNH</Text>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.max(2, progress)}%` }]} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  koreanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  vietnameseSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
    fontFamily: 'Epilogue, sans-serif',
  },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: '#E6E2D3',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B4513',
  },
  progressBarWrapper: {
    width: '100%',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D97706', // Orange
    borderRadius: 5,
  },
  boldTitle: { fontWeight: '900' },
  boldSubtitle: { fontWeight: '800' },
})

export default PronunciationRuleCard
