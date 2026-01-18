'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useAlphabetTest } from '../../api/alphabet-test-logic'
import { 
  AlphabetTestLayout as WebLayout,
  AlphabetTestMain as WebMain,
  AlphabetTestLayoutMobile as MobileLayout,
  AlphabetTestMainMobile as MobileMain
} from '../../api/alphabet-test-index'

/**
 * AlphabetTestScreen: Trang kiểm tra chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetTestScreen({
  onBackPress,
  onClose,
}) {
  const {
    questions,
    selectedAnswers,
    showResults,
    score,
    isSubmitted,
    progress,
    handleAnswerSelect,
    handleSubmit,
  } = useAlphabetTest()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        questions={questions}
        selectedAnswers={selectedAnswers}
        showResults={showResults}
        score={score}
        isSubmitted={isSubmitted}
        progress={progress}
        onClose={onClose}
        onBackPress={onBackPress}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={handleSubmit}
      />
    </Layout>
  )
}

export default AlphabetTestScreen
