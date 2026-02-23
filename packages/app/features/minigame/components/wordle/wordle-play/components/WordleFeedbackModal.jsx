import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native'

/**
 * Modal hiển thị feedback chi tiết sau khi submit câu văn
 *
 * Props:
 * - visible: boolean
 * - loading: boolean
 * - data: {
 *     targetWord: string
 *     meaningText?: string
 *     aiFeedback?: {
 *       totalScore?: number
 *       meaning?: { score?: number; maxScore?: number; feedback?: string }
 *       grammar?: { score?: number; maxScore?: number; feedback?: string }
 *       naturalness?: { score?: number; maxScore?: number; feedback?: string }
 *       generalFeedback?: string
 *       correctedSentence?: string
 *     }
 *   }
 * - onConfirm: () => void
 */
export function WordleFeedbackModal({ visible, loading, data, onConfirm }) {
  if (!visible) return null

  const targetWord = data?.targetWord || ''
  const meaningText = data?.meaningText || data?.meaning || ''
  const ai = data?.aiFeedback || {}

  const totalScore = Number(ai?.totalScore ?? 0)

  const meaning = ai?.meaning || {}
  const grammar = ai?.grammar || {}
  const naturalness = ai?.naturalness || {}

  const generalFeedback = ai?.generalFeedback || ''
  const correctedSentence = ai?.correctedSentence || ''

  const renderProgressBar = ({ label, score = 0, maxScore = 100 }) => {
    const safeMax = maxScore > 0 ? maxScore : 100
    const percent = Math.max(0, Math.min(100, (score / safeMax) * 100))

    return (
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>
            {Math.round(score)} / {safeMax}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Đánh giá câu văn</Text>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Keyword & Meaning */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Keyword</Text>
            <Text style={styles.sectionValue}>{targetWord || '—'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Định nghĩa</Text>
            <Text style={styles.sectionValue}>{meaningText || '—'}</Text>
          </View>

          {/* Total score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng điểm</Text>
            {renderProgressBar({
              label: 'Tổng điểm',
              score: totalScore,
              maxScore: 100,
            })}
          </View>

          {/* Meaning / Vocabulary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Từ vựng</Text>
            {renderProgressBar({
              label: 'Từ vựng',
              score: Number(meaning.score ?? 0),
              maxScore: Number(meaning.maxScore ?? 100),
            })}
            {!!meaning.feedback && (
              <Text style={styles.feedbackText}>{meaning.feedback}</Text>
            )}
          </View>

          {/* Grammar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngữ pháp</Text>
            {renderProgressBar({
              label: 'Ngữ pháp',
              score: Number(grammar.score ?? 0),
              maxScore: Number(grammar.maxScore ?? 100),
            })}
            {!!grammar.feedback && (
              <Text style={styles.feedbackText}>{grammar.feedback}</Text>
            )}
          </View>

          {/* Naturalness */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Độ tự nhiên</Text>
            {renderProgressBar({
              label: 'Độ tự nhiên',
              score: Number(naturalness.score ?? 0),
              maxScore: Number(naturalness.maxScore ?? 100),
            })}
            {!!naturalness.feedback && (
              <Text style={styles.feedbackText}>{naturalness.feedback}</Text>
            )}
          </View>

          {/* General feedback */}
          {!!generalFeedback && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feedback tổng quan</Text>
              <Text style={styles.feedbackText}>{generalFeedback}</Text>
            </View>
          )}

          {/* Corrected sentence */}
          {!!correctedSentence && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Câu mẫu gợi ý</Text>
              <Text style={styles.correctedSentence}>{correctedSentence}</Text>
            </View>
          )}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
            loading && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {totalScore > 80 ? 'Tiếp tục' : 'Xem bảng xếp hạng'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3500,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(4px)',
      },
    }),
  },
  card: {
    width: '95%',
    maxWidth: 720,
    maxHeight: '90vh',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    gap: 12,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#757575',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 6,
  },
  progressBlock: {
    marginBottom: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  progressBarBg: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    minWidth: 2,
  },
  feedbackText: {
    fontSize: 14,
    color: '#424242',
    marginTop: 4,
    lineHeight: 20,
  },
  correctedSentence: {
    fontSize: 15,
    color: '#1A237E',
    fontWeight: '600',
    lineHeight: 22,
  },
  confirmButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  confirmButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonDisabled: {
    opacity: 0.6,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default WordleFeedbackModal


