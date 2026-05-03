import { useMemo } from 'react'
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { FlagFilled } from '@ant-design/icons'

export function RoadmapTestDashboard({
  totalQuestions = 8, // dùng cho fallback
  questionNumbers = [], // danh sách questionNo thật của section hiện tại
  answers = {},
  onSubmit,
  isSubmitting = false,
  isLastSection = false,
  currentQuestion = 1,
  onQuestionSelect,
  markedQuestions = {},
}) {
  // Dùng danh sách questionNumbers từ API, fallback sang 1..totalQuestions nếu chưa truyền vào
  // Sắp xếp theo thứ tự tăng dần
  const allQuestionNumbers =
    questionNumbers && questionNumbers.length > 0
      ? [...questionNumbers].sort((a, b) => a - b)
      : Array.from({ length: totalQuestions }, (_, i) => i + 1)

  const effectiveTotalQuestions = allQuestionNumbers.length
  // Hiển thị tất cả câu, không chia trang
  const questionsOnPage = allQuestionNumbers

  const answeredCount = useMemo(() => {
    const isAnswered = (v) => {
      if (typeof v === 'number') return v > 0
      if (typeof v === 'string') return v.trim().length > 0
      if (v && typeof v === 'object') {
        return String(v.a || '').trim().length > 0 || String(v.b || '').trim().length > 0
      }
      return false
    }

    return Object.values(answers || {}).filter(isAnswered).length
  }, [answers])


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bảng câu hỏi</Text>
        <Text style={styles.headerSubtitle}>
          {effectiveTotalQuestions} câu
          {typeof answeredCount === 'number' ? ` • Đã làm ${answeredCount}` : ''}
        </Text>
      </View>

      {/* Questions Grid with ScrollView */}
      <ScrollView
        contentContainerStyle={styles.questionsContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
      >
        {questionsOnPage.map((questionNum) => (
          <Pressable
            key={questionNum}
            onPress={() => onQuestionSelect && onQuestionSelect(questionNum)}
            style={({ pressed, hovered }) => [
              styles.questionBox,
              currentQuestion === questionNum && styles.questionBoxActive,
              currentQuestion !== questionNum &&
              markedQuestions[questionNum] &&
              styles.questionBoxMarked,
              currentQuestion !== questionNum &&
              !markedQuestions[questionNum] &&
              answers?.[questionNum] !== undefined &&
              answers?.[questionNum] !== null &&
              (typeof answers?.[questionNum] === 'number'
                ? answers?.[questionNum] > 0
                : typeof answers?.[questionNum] === 'string'
                  ? String(answers?.[questionNum]).trim().length > 0
                  : typeof answers?.[questionNum] === 'object'
                    ? String(answers?.[questionNum]?.a || '').trim().length > 0 ||
                    String(answers?.[questionNum]?.b || '').trim().length > 0
                    : false) &&
              styles.questionBoxAnswered,
              hovered && styles.questionBoxHovered,
              pressed && styles.questionBoxPressed,
            ]}
          >
            <Text
              style={[
                styles.questionNumber,
                currentQuestion === questionNum && styles.questionNumberActive,
                currentQuestion !== questionNum && markedQuestions[questionNum] && styles.questionNumberMarked,
              ]}
            >
              {questionNum}
            </Text>
            {markedQuestions[questionNum] && (
              <View style={styles.flagIconContainer}>
                <FlagFilled style={StyleSheet.flatten(styles.flagIcon)} />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {/* Navigation, Save and Submit */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={onSubmit}
          disabled={isSubmitting}
          style={({ pressed, hovered }) => [
            styles.submitButton,
            hovered && styles.submitButtonHovered,
            pressed && styles.submitButtonPressed,
            isSubmitting && styles.submitButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isLastSection ? 'Nộp Bài' : 'Xác nhận & Sang phần tiếp'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  header: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollArea: {
    flex: 1,
  },
  questionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  questionBox: {
    width: 64,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  questionBoxHovered: {
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }),
  },
  questionBoxPressed: {
    transform: [{ scale: 0.96 }],
  },
  questionBoxAnswered: {
    backgroundColor: '#E6FFFA',
    borderColor: '#B2F5EA',
  },
  questionBoxMarked: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  questionBoxActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 4px rgba(0,0,0,0.1)',
    }),
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6B7280',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionNumberMarked: {
    color: '#EF4444',
  },
  flagIconContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  flagIcon: {
    fontSize: 8,
    color: '#EF4444',
  },
  questionNumberActive: {
    color: '#FFFFFF',
  },
  bottomSection: {
    gap: 10,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#F1BE4B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease',
    }),
  },
  submitButtonHovered: {
    backgroundColor: '#F3C96D',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
    }),
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})
