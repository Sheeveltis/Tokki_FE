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
    showContinueDialog,
    hasMoreFlashcards,
    allWordsCompleted,
    handleContinueLearning,
    handleStopLearning,
    completedInBatch,
    batchSize,
  } = useFlashcardFirstLearn(topicId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  const canContinue = currentStepKey !== 'view' || hasFlippedOnce

  // Ensure we only navigate back once even if multiple state transitions happen.
  const didNavigateBackRef = React.useRef(false)

  const safeBack = React.useCallback(() => {
    if (didNavigateBackRef.current) return
    didNavigateBackRef.current = true
    onBackPress?.()
  }, [onBackPress])

  // When user chooses to stop learning from the modal, navigate back immediately (deterministic),
  // instead of relying on the "allWordsCompleted" auto-back effect timing.
  const handleStopAndExit = React.useCallback(() => {
    handleStopLearning()
    safeBack()
  }, [handleStopLearning, safeBack])

  // Nếu đã học hết tất cả từ vựng, tự động quay về danh sách sau 2 giây
  React.useEffect(() => {
    if (didNavigateBackRef.current) return
    if (allWordsCompleted && !showContinueDialog) {
      const timer = setTimeout(() => {
        safeBack()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [allWordsCompleted, showContinueDialog, safeBack])

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
        showContinueDialog={showContinueDialog}
        hasMoreFlashcards={hasMoreFlashcards}
        allWordsCompleted={allWordsCompleted}
        onContinueLearning={handleContinueLearning}
        onStopLearning={handleStopAndExit}
        completedInBatch={completedInBatch}
        batchSize={batchSize}
      />
    </Layout>
  )
}

export default FlashcardFirstLearnScreen


