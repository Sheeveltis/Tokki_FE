import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Platform, TouchableOpacity } from 'react-native'
import CloseIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import RandomIcon from '../../../../../../assets/icon/icon-mainflow/random.svg'
import SettingIcon from '../../../../../../assets/icon/icon-mainflow/setting.svg'
import { QuestionCard, TypeAnswerCard, SettingsModal } from '../index'
import { normalizeImageSource } from '../../../api'
import { LoadingWithContainer } from '../../../../../../components/Loading'

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
  showSettings,
  onOpenSettings,
  onCloseSettings,
  onSettingsChange,
  typedAnswers,
  onTypedAnswer,
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
      <View style={styles.topHeader}>
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressNumber}>{answeredCount || 0}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressNumber}>{questions.length}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {onShuffle && (
            <TouchableOpacity
              style={[
                styles.randomButton,
                isShuffled && styles.randomButtonActive
              ]}
              onPress={onShuffle}
            >
              <Image
                source={normalizeImageSource(RandomIcon)}
                style={styles.randomIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {onOpenSettings && (
            <TouchableOpacity
              style={styles.settingButton}
              onPress={onOpenSettings}
            >
              <Image
                source={normalizeImageSource(SettingIcon)}
                style={styles.settingIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {onClose && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Score Display - Hiển thị ở trên cùng khi đã nộp bài */}
      {isSubmitted && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            Điểm: {score} / {questions.length}
          </Text>
          <Text style={styles.scorePercentage}>
            ({Math.round((score / questions.length) * 100)}%)
          </Text>
        </View>
      )}

      {/* Current Question */}
      {currentQuestion && (
        <View style={styles.questionContainer}>
          {answerMode === 'typeAnswer' ? (
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
          )}
        </View>
      )}

      {/* Navigation Buttons - Hiển thị khi đã nộp bài để xem lại */}
      {isSubmitted && questions.length > 1 && (
        <View style={styles.navigationContainer}>
          <Pressable 
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.navButtonDisabled
            ]} 
            onPress={onPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>← Câu trước</Text>
          </Pressable>
          <Pressable 
            style={[
              styles.navButton,
              currentQuestionIndex === questions.length - 1 && styles.navButtonDisabled
            ]} 
            onPress={onNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
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
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    minWidth: 30,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  randomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1BE4B',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  randomButtonActive: {
    backgroundColor: '#79964E', // Màu xanh lá khi đang random
  },
  randomIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  settingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1BE4B',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  settingIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#1F1F1F',
    lineHeight: 24,
  },
  questionContainer: {
    width: '100%',
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
})

