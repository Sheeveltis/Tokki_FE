'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Platform } from 'react-native'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import CloseIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg' // Tạm dùng arrow, có thể thay sau
import { QuestionCard } from '../../components/test'
import { normalizeImageSource } from '../../api'
import { studyStyles } from '../../styles'
import { getFlashcardsByTopic } from '../../api'
import { LoadingWithContainer } from '../../../../../components/Loading'
import KoreanImage from '../../../../../assets/icon/icon-mainflow/korean.png'

/**
 * TestScreen: Trang kiểm tra flashcard với câu hỏi trắc nghiệm
 * Hiển thị tất cả câu hỏi trong một danh sách dọc
 * @param {{
 *   topicId?: string
 *   title?: string
 *   onBackPress?: () => void
 *   onClose?: () => void
 * }} props
 */
export function TestScreen({
  topicId,
  title = 'Kiểm Tra Từ Vựng',
  onBackPress,
  onClose,
}) {
  const [flashcards, setFlashcards] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState({})
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allAnswered, setAllAnswered] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch flashcards từ API
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      setFlashcards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  // Tạo câu hỏi từ flashcards
  useEffect(() => {
    if (flashcards.length > 0) {
      const generatedQuestions = flashcards.map((flashcard, index) => {
        // Tạo 3 đáp án sai ngẫu nhiên
        const wrongAnswers = flashcards
          .filter((f, i) => i !== index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((f) => ({ id: `wrong-${f.word}`, text: f.word }))

        // Tạo 4 đáp án (1 đúng + 3 sai)
        const allAnswers = [
          { id: `correct-${flashcard.word}`, text: flashcard.word },
          ...wrongAnswers,
        ].sort(() => Math.random() - 0.5)

        return {
          id: `question-${index}`,
          question: flashcard.meaning,
          correctAnswerId: `correct-${flashcard.word}`,
          options: allAnswers,
          imageUrl: KoreanImage, // Có thể thay bằng hình ảnh từ flashcard nếu có
        }
      })
      setQuestions(generatedQuestions)
    }
  }, [flashcards])

  const progress = questions.length > 0 
    ? Math.round((Object.keys(selectedAnswers).length / questions.length) * 100) 
    : 0

  const handleAnswerSelect = (questionId, answerId, isCorrect) => {
    // Chỉ cho phép chọn một lần và chưa nộp bài
    if (selectedAnswers[questionId] || isSubmitted) return

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleSubmit = () => {
    if (isSubmitted) return

    // Tính điểm và hiển thị kết quả cho tất cả câu hỏi
    let calculatedScore = 0
    const results = {}

    questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id]
      // Đánh dấu tất cả câu hỏi để hiển thị đáp án đúng
      results[question.id] = true
      if (selectedAnswer) {
        const isCorrect = selectedAnswer === question.correctAnswerId
        if (isCorrect) {
          calculatedScore++
        }
      }
    })

    setScore(calculatedScore)
    setShowResults(results)
    setIsSubmitted(true)
  }

  // Kiểm tra xem đã trả lời hết chưa
  useEffect(() => {
    if (questions.length > 0 && Object.keys(selectedAnswers).length === questions.length) {
      setAllAnswered(true)
    }
  }, [selectedAnswers, questions.length])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  // Render loading state
  if (loading) {
    return (
      <View style={styles.root}>
        <LoadingWithContainer
          size={48}
          color="#F1BE4B"
          shadowColor="#F1BE4B50"
          text="Đang tải câu hỏi..."
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        />
      </View>
    )
  }

  // Render error state
  if (error && flashcards.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.contentWrapper}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchFlashcards}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  if (questions.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.contentWrapper}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có câu hỏi nào</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {/* Header với progress và close button */}
        <View style={styles.topHeader}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Object.keys(selectedAnswers).length} / {questions.length} câu đã trả lời
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          {onClose && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Image
                source={normalizeImageSource(CloseIcon)}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </Pressable>
          )}
        </View>

        {/* Questions List */}
        <ScrollView 
          style={styles.questionsList}
          contentContainerStyle={styles.questionsListContent}
          showsVerticalScrollIndicator={true}
        >
          {questions.map((question, index) => (
            <View key={question.id} style={styles.questionItem}>
              <View style={styles.questionNumber}>
                <Text style={styles.questionNumberText}>Câu {index + 1}</Text>
              </View>
              <QuestionCard
                question={question.question}
                options={question.options}
                correctAnswerId={question.correctAnswerId}
                imageUrl={question.imageUrl}
                onAnswerSelect={(answerId, isCorrect) => 
                  handleAnswerSelect(question.id, answerId, isCorrect)
                }
                showResult={isSubmitted}
                disabled={isSubmitted}
                selectedAnswerId={selectedAnswers[question.id]}
              />
            </View>
          ))}
        </ScrollView>

        {/* Submit Button hoặc Score */}
        {!isSubmitted ? (
          <Pressable
            style={[
              styles.submitButton,
              Object.keys(selectedAnswers).length < questions.length && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
          >
            <Text style={styles.submitButtonText}>Nộp bài</Text>
          </Pressable>
        ) : (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              Điểm: {score} / {questions.length}
            </Text>
            <Text style={styles.scorePercentage}>
              ({Math.round((score / questions.length) * 100)}%)
            </Text>
            <Pressable style={styles.finishButton} onPress={onBackPress}>
              <Text style={styles.finishButtonText}>Hoàn thành</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    gap: 24,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    flex: 1,
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 8,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 4,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  questionsList: {
    width: '100%',
    flex: 1,
  },
  questionsListContent: {
    gap: 24,
    paddingBottom: 16,
  },
  questionItem: {
    width: '100%',
    gap: 12,
  },
  questionNumber: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1BE4B',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#79964E',
    borderRadius: 8,
    shadowColor: '#79964E',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#79964E',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#79964E',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  scoreContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  scorePercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

export default TestScreen

