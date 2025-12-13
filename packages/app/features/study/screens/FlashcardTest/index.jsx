'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardTest } from './useFlashcardTest'
import { 
  FlashcardTestLayout as WebLayout,
  FlashcardTestMain as WebMain,
  FlashcardTestLayoutMobile as MobileLayout,
  FlashcardTestMainMobile as MobileMain
} from '../../components/flashcard/flashcard-test'

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
}) {
  const {
    flashcards,
    questions,
    selectedAnswers,
    showResults,
    score,
    loading,
    error,
    allAnswered,
    isSubmitted,
    progress,
    handleAnswerSelect,
    handleSubmit,
    fetchFlashcards,
  } = useFlashcardTest(topicId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        questions={questions}
        selectedAnswers={selectedAnswers}
        progress={progress}
        isSubmitted={isSubmitted}
        score={score}
        loading={loading}
        error={error}
        flashcards={flashcards}
        onClose={onClose}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmit}
        onRetry={fetchFlashcards}
        onBackPress={onBackPress}
      />
    </Layout>
  )
}

export default FlashcardTestScreen

