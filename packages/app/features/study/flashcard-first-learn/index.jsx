import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardFirstLearn } from './useFlashcardFirstLearn'
import {
  FlashcardFirstLearnLayout as WebLayout,
  FlashcardFirstLearnMain as WebMain,
  FlashcardFirstLearnLayoutMobile as MobileLayout,
  FlashcardFirstLearnMainMobile as MobileMain,
} from './components'

export function FlashcardFirstLearnScreen({ topicId, title = 'Học lần đầu', onBackPress }) {
  const {
    flashcards,
    current,
    currentIndex,
    total,
    step,
    currentStepKey,
    isFlipped,
    hasFlippedOnce,
    loading,
    error,
    userAnswer,
    showResult,
    isCorrect,
    setUserAnswer,
    handleFlip,
    handleSubmit,
    handleContinue,
    fetchFlashcards,
    playAudio,
    progress,
    isTopicCompleted,
  } = useFlashcardFirstLearn(topicId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  const canContinue = currentStepKey !== 'view' || hasFlippedOnce

  return (
    <Layout>
      <Main
        title={title}
        current={current}
        currentIndex={currentIndex}
        total={total}
        currentStepKey={currentStepKey}
        isFlipped={isFlipped}
        loading={loading}
        error={error}
        userAnswer={userAnswer}
        showResult={showResult}
        isCorrect={isCorrect}
        setUserAnswer={setUserAnswer}
        onFlip={handleFlip}
        onSubmit={handleSubmit}
        onContinue={handleContinue}
        canContinue={canContinue}
        onBackPress={onBackPress}
        onRetry={fetchFlashcards}
        onPlaySound={playAudio}
        progress={progress}
        flashcards={flashcards}
        isTopicCompleted={isTopicCompleted}
      />
    </Layout>
  )
}

export default FlashcardFirstLearnScreen


