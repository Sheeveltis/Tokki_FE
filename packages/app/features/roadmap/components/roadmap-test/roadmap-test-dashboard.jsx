import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export function RoadmapTestDashboard({
  totalQuestions = 8, // dùng cho fallback
  questionNumbers = [], // danh sách questionNo thật của section hiện tại
  answers = {},
  onSubmit,
  onSave,
  isSaving = false,
  currentQuestion = 1,
  onQuestionSelect,
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

      {/* Questions Grid */}
      <View style={styles.questionsContainer}>
        {questionsOnPage.map((questionNum) => (
          <Pressable
            key={questionNum}
            onPress={() => onQuestionSelect && onQuestionSelect(questionNum)}
            style={[
              styles.questionBox,
              currentQuestion === questionNum && styles.questionBoxActive,
              currentQuestion !== questionNum &&
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
            ]}
          >
            <Text
              style={[
                styles.questionNumber,
                currentQuestion === questionNum && styles.questionNumberActive,
              ]}
            >
              {questionNum}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Navigation, Save and Submit */}
      <View style={styles.bottomSection}>
        {onSave && (
          <Pressable
            onPress={onSave}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isSaving && styles.saveButtonDisabled,
            ]}
          >
            <Text style={styles.saveButtonText}>{isSaving ? 'Đang lưu...' : 'Lưu bài'}</Text>
          </Pressable>
        )}
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}>
          <Text style={styles.submitButtonText}>Nộp Bài</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 24,
    maxWidth: 600,
    alignSelf: 'center',
    borderRadius: 30,
  },
  header: {
    gap: 6,
    alignItems: 'center',
    paddingVertical: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionsContainer: {
    width: 288, // Cố định width cho 5 ô: (5 * 48px) + (4 * 12px gap) = 240 + 48 = 288px
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 12,
    justifyContent: 'flex-start',
  },
  questionBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // chưa làm
    borderWidth: 1,
    borderColor: '#E8E0C8',
  },
  questionBoxAnswered: {
    backgroundColor: '#F6B4C3', // hồng - đã làm
    borderColor: '#E99AAF',
  },
  questionBoxActive: {
    backgroundColor: '#FFE7A5', // vàng - đang chọn
    borderColor: '#E8C96A',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  questionNumberActive: {
    color: '#1C1C1C',
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  arrowButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  saveButton: {
    backgroundColor: '#FFF4DA',
    minWidth: 140,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8C96A',
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitButton: {
    backgroundColor: '#E8B4B8',
    minWidth: 200,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

