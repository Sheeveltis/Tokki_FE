import { Modal, View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native'

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
  const userSentence = data?.userSentence || ''

  const getColorForPercent = (percent) => {
    if (percent <= 30) return '#D32F2F' // Red
    if (percent <= 60) return '#F57C00' // Orange
    if (percent <= 79) return '#FBC02D' // Yellow
    return '#388E3C' // Green
  }

  const renderProgressBar = ({ label, score = 0, maxScore = 100 }) => {
    const safeMax = maxScore > 0 ? maxScore : 100
    const percent = Math.max(0, Math.min(100, (score / safeMax) * 100))
    const color = getColorForPercent(percent)

    return (
      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={[styles.progressValue, { color }]}>
            {Math.round(score)} / {safeMax}
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
      </View>
    )
  }

  const content = (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Đánh giá câu văn</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Keyword</Text>
            <View style={styles.keywordBadge}>
              <Text style={styles.sectionValueCombined}>
                <Text style={styles.keywordText}>{targetWord || '—'}</Text>
                <Text style={styles.definitionDivider}> : </Text>
                <Text style={styles.definitionText}>{meaningText || '—'}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitleUnique}>Câu của bạn</Text>
            <Text style={styles.userSentenceText}>{userSentence || '—'}</Text>
          </View>

          <View style={styles.section}>
            {renderProgressBar({ label: 'Tổng điểm', score: totalScore, maxScore: 100 })}
          </View>
          <View style={styles.section}>
            {renderProgressBar({
              label: 'Từ vựng',
              score: Number(meaning.score ?? 0),
              maxScore: Number(meaning.maxScore ?? 100),
            })}
            {!!meaning.feedback && <Text style={styles.feedbackText}>{meaning.feedback}</Text>}
          </View>
          <View style={styles.section}>
            {renderProgressBar({
              label: 'Ngữ pháp',
              score: Number(grammar.score ?? 0),
              maxScore: Number(grammar.maxScore ?? 100),
            })}
            {!!grammar.feedback && <Text style={styles.feedbackText}>{grammar.feedback}</Text>}
          </View>
          <View style={styles.section}>
            {renderProgressBar({
              label: 'Độ tự nhiên',
              score: Number(naturalness.score ?? 0),
              maxScore: Number(naturalness.maxScore ?? 100),
            })}
            {!!naturalness.feedback && (
              <Text style={styles.feedbackText}>{naturalness.feedback}</Text>
            )}
          </View>

          {!!generalFeedback && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feedback tổng quan</Text>
              <Text style={styles.feedbackText}>{generalFeedback}</Text>
            </View>
          )}

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
          <Text style={styles.confirmButtonText}>Tiếp tục</Text>
        </Pressable>
      </View>
    </View>
  )

  if (Platform.OS === 'web') {
    return content
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      {content}
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        width: '100vw',
        height: '100vh',

        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',

        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        zIndex: 9999,

        padding: 16,
        backdropFilter: 'blur(6px)',
      },
      default: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      },
    }),
  },

  card: {
    width: '100%',
    maxWidth: 1000,
    maxHeight: Platform.OS === 'web' ? '90vh' : '88%',

    backgroundColor: '#FFF9E3',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#8D6E63',

    paddingVertical: 20,
    paddingHorizontal: 18,

    alignSelf: 'center',

    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      },
      default: {
        elevation: 12,
      },
    }),
  },

  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 12,
  },

  scroll: {
    maxHeight: '70vh',
    width: '100%',
  },

  scrollContent: {
    paddingBottom: 12,
    gap: 6,
  },

  section: {
    marginBottom: 4,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#11560dff',
    marginBottom: 5,
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

  sectionTitleUnique: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 4,
  },

  userSentenceText: {
    fontSize: 17,
    color: '#8B4513',
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 22,
  },

  keywordBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffecc8ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  sectionValueCombined: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keywordText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#247f2aff',
  },
  definitionDivider: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000ff',
  },
  definitionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4E342E',
  },

  progressBlock: {
    marginBottom: 2,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },

  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },

  progressValue: {
    fontSize: 14,
    fontWeight: '900',
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
    marginTop: 14,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 4px 8px rgba(0,0,0,0.2)',
    }),
  },

  confirmButtonPressed: {
    opacity: 0.85,
    ...(Platform.OS === 'web' ? { transform: [{ translateY: 2 }] } : { transform: [{ scale: 0.97 }] }),
  },

  confirmButtonDisabled: {
    backgroundColor: '#CFD8DC',
    opacity: 0.6,
  },

  confirmButtonText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    ...Platform.select({
      web: {
        textShadow: '1px 1px 1px rgba(0,0,0,0.2)',
      },
      default: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
      },
    }),
  },
})

export default WordleFeedbackModal