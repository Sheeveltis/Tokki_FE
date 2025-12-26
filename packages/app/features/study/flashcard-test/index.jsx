'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardTest } from './useFlashcardTest'
import { 
  FlashcardTestLayout as WebLayout,
  FlashcardTestMain as WebMain,
  FlashcardTestLayoutMobile as MobileLayout,
  FlashcardTestMainMobile as MobileMain
} from './components'

/**
 * FlashcardTestScreen: Trang kiểm tra flashcard với câu hỏi trắc nghiệm
 * Điều phối giữa web và mobile layout
 * Hiển thị tất cả câu hỏi trong một danh sách dọc
 * @param {{
 *   topicId?: string
 *   title?: string
 *   onBackPress?: () => void
 *   onClose?: () => void
 * }} props
 */
export function FlashcardTestScreen({
  topicId,
  title = 'Kiểm Tra Từ Vựng',
  onBackPress,
  onClose,
  isFavoritesMode = false,
}) {
  const {
    flashcards,
    questions,
    selectedAnswers,
    typedAnswers,
    showResults,
    score,
    loading,
    error,
    allAnswered,
    isSubmitted,
    progress,
    answeredCount,
    currentQuestionIndex,
    currentQuestion,
    isShuffled,
    questionMode,
    answerMode,
    showSettings,
    handleAnswerSelect,
    handleTypedAnswer,
    handleSubmit,
    handleNextQuestion,
    handlePreviousQuestion,
    fetchFlashcards,
    toggleShuffle,
    setShowSettings,
    handleSettingsChange,
  } = useFlashcardTest(topicId, isFavoritesMode)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        questions={questions}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswers={selectedAnswers}
        showResults={showResults}
        progress={progress}
        answeredCount={answeredCount}
        isSubmitted={isSubmitted}
        score={score}
        loading={loading}
        error={error}
        flashcards={flashcards}
        onClose={onClose}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmit}
        onNextQuestion={handleNextQuestion}
        onPreviousQuestion={handlePreviousQuestion}
        onRetry={fetchFlashcards}
        onBackPress={onBackPress}
        onShuffle={toggleShuffle}
        isShuffled={isShuffled}
        questionMode={questionMode}
        answerMode={answerMode}
        showSettings={showSettings}
        onOpenSettings={() => setShowSettings(true)}
        onCloseSettings={() => setShowSettings(false)}
        onSettingsChange={handleSettingsChange}
        typedAnswers={typedAnswers}
        onTypedAnswer={handleTypedAnswer}
      />
    </Layout>
  )
}

export default FlashcardTestScreen

