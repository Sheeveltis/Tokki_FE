import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native'
import CloseIcon from '../assets/icon/icon-mainflow/arrow.svg'
import { QuestionCard, TypeAnswerCard } from '../index'
import { normalizeImageSource } from '../api'
import { LoadingWithContainer } from '../components/Loading'

/**
 * FlashcardTestMain (Mobile): Nội dung chính của trang test flashcard trên mobile
 */
export function FlashcardTestMain({
  questions,
  currentQuestion,
  currentQuestionIndex,
  selectedAnswers,
  showResults,
  progress,
  answeredCount,
  isSubmitted,
  score,
  loading,
  error,
  flashcards,
  onClose,
  onAnswerSelect,
  onSubmit,
  onNextQuestion,
  onPreviousQuestion,
  onRetry,
  onBackPress,
  answerMode,
  typedAnswers,
  onTypedAnswer,
  // Parts management
  enableParts = false,
  parts = [],
  currentPart = 0,
  totalParts = 1,
  currentPartQuestions = [],
  currentPartAnsweredCount = 0,
  currentPartProgress = 0,
  onPartChange,
  allQuestions = [],
}) {
  // Render loading state
  if (loading) {
    return (
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
    )
  }

  // Render error state
  if (error && flashcards.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    )
  }

  if (questions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có câu hỏi nào</Text>
      </View>
    )
  }

  return (
    <>
      {/* Header với progress và close button */}
      <View style={styles.topHeader}>
        <View style={styles.progressContainer}>
          {/* Part Navigation - Hiển thị khi enableParts */}
          {enableParts && totalParts > 1 && (
            <View style={styles.partsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {parts.map((_, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.partButton,
                      currentPart === index && styles.partButtonActive,
                    ]}
                    onPress={() => onPartChange?.(index)}
                  >
                    <Text style={[
                      styles.partButtonText,
                      currentPart === index && styles.partButtonTextActive,
                    ]}>
                      Part {index + 1}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          
          <Text style={styles.progressText}>
            Đã làm: {enableParts ? currentPartAnsweredCount : answeredCount || 0} / {enableParts ? currentPartQuestions.length : questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${enableParts ? currentPartProgress : progress}%` }]} />
          </View>
          
          {/* Tổng progress nếu có nhiều parts */}
          {enableParts && totalParts > 1 && (
            <Text style={styles.totalProgressText}>
              Tổng: {answeredCount || 0} / {allQuestions.length} ({progress}%)
            </Text>
          )}
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

      {/* Current Question */}
      {currentQuestion && (
        <View style={styles.questionContainer}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>Câu {currentQuestionIndex + 1}</Text>
          </View>
          {(() => {
            // Xác định loại câu trả lời cho câu hỏi hiện tại
            const questionAnswerType = answerMode === 'mix' 
              ? currentQuestion.answerType 
              : answerMode

            return questionAnswerType === 'typeAnswer' ? (
              <TypeAnswerCard
                question={currentQuestion.question}
                correctAnswer={currentQuestion.correctAnswer}
                imageUrl={currentQuestion.imageUrl}
                onAnswerSubmit={(typedText) => 
                  onTypedAnswer(currentQuestion.id, typedText)
                }
                showResult={showResults[currentQuestion.id] || isSubmitted}
                disabled={!!typedAnswers[currentQuestion.id] || isSubmitted}
                typedAnswer={typedAnswers[currentQuestion.id] || ''}
              />
            ) : (
              <QuestionCard
                question={currentQuestion.question}
                options={currentQuestion.options}
                correctAnswerId={currentQuestion.correctAnswerId}
                imageUrl={currentQuestion.imageUrl}
                onAnswerSelect={(answerId, isCorrect) => 
                  onAnswerSelect(currentQuestion.id, answerId, isCorrect)
                }
                showResult={showResults[currentQuestion.id] || false}
                disabled={!!selectedAnswers[currentQuestion.id]}
                selectedAnswerId={selectedAnswers[currentQuestion.id]}
              />
            )
          })()}
        </View>
      )}

      {/* Navigation Buttons */}
      {!isSubmitted && (
        <View style={styles.navigationContainer}>
          <Pressable
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={onPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>Câu trước</Text>
          </Pressable>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <Pressable
              style={[
                styles.navButton,
                styles.navButtonPrimary,
                (() => {
                  const questionAnswerType = answerMode === 'mix' 
                    ? currentQuestion?.answerType 
                    : answerMode
                  const isAnswered = questionAnswerType === 'typeAnswer'
                    ? typedAnswers[currentQuestion?.id]?.trim()
                    : selectedAnswers[currentQuestion?.id]
                  return !isAnswered && styles.navButtonDisabled
                })(),
              ]}
              onPress={onNextQuestion}
              disabled={(() => {
                const questionAnswerType = answerMode === 'mix' 
                  ? currentQuestion?.answerType 
                  : answerMode
                return questionAnswerType === 'typeAnswer'
                  ? !typedAnswers[currentQuestion?.id]?.trim()
                  : !selectedAnswers[currentQuestion?.id]
              })()}
            >
              <Text style={styles.navButtonText}>Câu tiếp theo</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.submitButton,
                (() => {
                  const questionAnswerType = answerMode === 'mix' 
                    ? currentQuestion?.answerType 
                    : answerMode
                  const isAnswered = questionAnswerType === 'typeAnswer'
                    ? typedAnswers[currentQuestion?.id]?.trim()
                    : selectedAnswers[currentQuestion?.id]
                  return !isAnswered && styles.submitButtonDisabled
                })(),
              ]}
              onPress={onSubmit}
              disabled={(() => {
                const questionAnswerType = answerMode === 'mix' 
                  ? currentQuestion?.answerType 
                  : answerMode
                return questionAnswerType === 'typeAnswer'
                  ? !typedAnswers[currentQuestion?.id]?.trim()
                  : !selectedAnswers[currentQuestion?.id]
              })()}
            >
              <Text style={styles.submitButtonText}>Nộp bài</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Score Display */}
      {isSubmitted && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Điểm: {score} / {enableParts ? allQuestions.length : questions.length}
          </Text>
          <Text style={styles.scorePercentage}>
            ({Math.round((score / (enableParts ? allQuestions.length : questions.length)) * 100)}%)
          </Text>
          <Pressable style={styles.finishButton} onPress={onBackPress}>
            <Text style={styles.finishButtonText}>Hoàn thành</Text>
          </Pressable>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
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
  partsContainer: {
    marginBottom: 8,
  },
  partButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  partButtonActive: {
    borderColor: '#79964E',
    backgroundColor: '#79964E20',
  },
  partButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  partButtonTextActive: {
    color: '#79964E',
    fontWeight: '700',
  },
  totalProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
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
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  questionContainer: {
    width: '100%',
    flex: 1,
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
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  navigationContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  navButtonPrimary: {
    backgroundColor: '#79964E',
    borderColor: '#79964E',
    shadowColor: '#79964E',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  navButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#79964E',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#79964E',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#999',
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

