import React from 'react'
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TouchableOpacity } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import CloseIcon from 'assets/icon/icon-mainflow/arrow.svg'
import SettingIcon from 'assets/icon/icon-mainflow/setting.svg'
import { QuestionCard, TypeAnswerCard, SettingsModal } from '../index'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { LoadingWithContainer } from 'components/Loading'

/**
 * FlashcardTestMain (Web): Nội dung chính của trang test flashcard trên web
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
  onShuffle,
  isShuffled,
  questionMode,
  answerMode,
  canChangeAnswerMode = true,
  showSettings,
  onOpenSettings,
  onCloseSettings,
  onSettingsChange,
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
    <View style={styles.mainContainer}>
      {/* Header với progress và close button */}
      <View style={styles.statsRow}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${enableParts ? currentPartProgress : progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Tiến độ: <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{enableParts ? currentQuestionIndex + 1 : currentQuestionIndex + 1} / {enableParts ? currentPartQuestions.length : questions.length}</Text>
          </Text>
        </View>

        <View style={styles.headerActions}>
          {onOpenSettings && (
            <TouchableOpacity
              style={styles.settingButton}
              onPress={onOpenSettings}
            >
              <StudyIcon
                source={SettingIcon}
                width={18}
                height={18}
                tintColor="#1A1A1A"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {enableParts && totalParts > 1 && (
        <View style={styles.partsContainer}>
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
                Phần {index + 1}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Score Display - Hiển thị ở trên cùng khi đã nộp bài */}
      {isSubmitted && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Điểm: {score} / {enableParts ? allQuestions.length : questions.length}
          </Text>
          <Text style={styles.scorePercentage}>
            ({Math.round((score / (enableParts ? allQuestions.length : questions.length)) * 100)}%)
          </Text>
        </View>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <View style={styles.questionContainer}>
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
                showResult={showResults[currentQuestion.id] || isSubmitted}
                selectedAnswerId={selectedAnswers[currentQuestion.id]}
                disabled={isSubmitted}
              />
            )
          })()}
          
          {/* Hint: Nhấn phím bất kỳ để tiếp tục (chỉ khi quiz mode và đã hiện đáp án) */}
          {enableParts && !isSubmitted && currentQuestion && showResults[currentQuestion.id] && (
            <View style={styles.keyboardHintContainer}>
              <Text style={styles.keyboardHintText}>
                💡 Nhấn phím bất kỳ để tiếp tục
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Navigation Buttons - Hiển thị khi đã nộp bài để xem lại */}
      {isSubmitted && (enableParts ? allQuestions.length > 1 : questions.length > 1) && (
        <View style={styles.navigationContainer}>
          <Pressable 
            style={[
              styles.navButton,
              (enableParts ? (currentPart === 0 && currentQuestionIndex === 0) : currentQuestionIndex === 0) && styles.navButtonDisabled
            ]} 
            onPress={onPreviousQuestion}
            disabled={enableParts ? (currentPart === 0 && currentQuestionIndex === 0) : currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>← Câu trước</Text>
          </Pressable>
          <Pressable 
            style={[
              styles.navButton,
              (enableParts ? (currentPart === totalParts - 1 && currentQuestionIndex === questions.length - 1) : currentQuestionIndex === questions.length - 1) && styles.navButtonDisabled
            ]} 
            onPress={onNextQuestion}
            disabled={enableParts ? (currentPart === totalParts - 1 && currentQuestionIndex === questions.length - 1) : currentQuestionIndex === questions.length - 1}
          >
            <Text style={styles.navButtonText}>Câu sau →</Text>
          </Pressable>
        </View>
      )}

      {/* Finish Button - Chỉ hiển thị khi đã nộp bài */}
      {isSubmitted && (
        <View style={styles.finishButtonContainer}>
          <Pressable style={styles.finishButton} onPress={onBackPress}>
            <Text style={styles.finishButtonText}>Hoàn thành</Text>
          </Pressable>
        </View>
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        questionMode={questionMode}
        answerMode={answerMode}
        canChangeAnswerMode={canChangeAnswerMode}
        onClose={onCloseSettings}
        onSave={onSettingsChange}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 16,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  progressSection: {
    flex: 1,
    gap: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 100,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  partsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  partButton: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  partButtonActive: {
    borderColor: '#1A1A1A',
    backgroundColor: '#1A1A1A',
  },
  partButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  partButtonTextActive: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  questionContainer: {
    width: '100%',
    marginTop: 8,
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  navButtonPrimary: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  navButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
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
    marginBottom: 8,
  },
  finishButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
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
  keyboardHintContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F1BE4B20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1BE4B',
    alignItems: 'center',
  },
  keyboardHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

