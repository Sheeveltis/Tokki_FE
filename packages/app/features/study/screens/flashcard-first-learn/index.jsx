import React, { useState } from 'react'

import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useFlashcardFirstLearn } from './useFlashcardFirstLearn'
import {
  FlashcardFirstLearnLayout as WebLayout,
  FlashcardFirstLearnMain as WebMain,
  FlashcardFirstLearnLayoutMobile as MobileLayout,
  FlashcardFirstLearnMainMobile as MobileMain,
  FlashcardFirstLearnListWeb,
  FlashcardFirstLearnListMobile,
  NavbarMobile,
} from './components'
import { useXp, XpConfigKeys, XpSourceList } from 'app/provider/xp'

// Conditional import để tránh lỗi trên web
let useRoute, useNavigation
if (Platform.OS !== 'web') {
  try {
    const navModule = require('@react-navigation/native')
    useRoute = navModule.useRoute
    useNavigation = navModule.useNavigation
  } catch (e) {
    // Ignore if not available
  }
}

export function FlashcardFirstLearnScreen({ 
  topicId: topicIdProp, 
  title = 'Học lần đầu', 
  onBackPress: onBackPressProp,
  route: routeProp,
  navigation: navigationProp,
}) {
  const { push, replace, query } = useRouter()
  
  // Lấy route và navigation từ hooks nếu không có trong props
  // Chỉ sử dụng hooks trên mobile để tránh lỗi trên web
  let route = routeProp
  let navigation = navigationProp
  
  if (Platform.OS !== 'web' && useRoute && useNavigation) {
    if (!route) {
      route = useRoute()
    }
    if (!navigation) {
      navigation = useNavigation()
    }
  }

  // Lấy topicId từ route params hoặc props
  const topicId = route?.params?.topicId || topicIdProp

  const [mode, setMode] = useState(Platform.OS === 'web' && query?.hideNavbar === 'true' ? 'learn' : 'list') // 'list' | 'learn'

  const { addXp } = useXp()

  // Handler cho nút back
  const handleBackPress = () => {
    if (onBackPressProp) {
      onBackPressProp()
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack()
    }
  }

  // Chuyển sang chế độ học
  const handleStartLearning = () => {
    setMode('learn')
    // Update URL trên web để hiển thị distraction-free (ẩn navbar)
    if (Platform.OS === 'web') {
      replace(`/flashcard/learn?topic=${topicId}&hideNavbar=true`, undefined, { shallow: true })
    }
  }

  // Thoát chế độ học quay về danh sách
  const handleExitLearning = () => {
    setMode('list')
    if (Platform.OS === 'web') {
      replace(`/flashcard/learn?topic=${topicId}`, undefined, { shallow: true })
    }
  }

  // Chuyển sang chế độ học Flashcard (study mode)
  const handleStartStudy = () => {
    push(`/flashcard/study?topic=${topicId}`)
  }

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
  } = useFlashcardFirstLearn(topicId, mode === 'learn')

  // Cộng XP khi hoàn thành 1 tour 5 từ (hiện dialog hỏi tiếp tục)
  React.useEffect(() => {
    if (showContinueDialog) {
      addXp(XpConfigKeys.COMPLETED_FLASHCARD_TOPIC, XpSourceList.VOCABULARY)
    }
  }, [showContinueDialog, addXp])

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain
  const List = Platform.OS === 'web' ? FlashcardFirstLearnListWeb : FlashcardFirstLearnListMobile

  const canContinue = currentStepKey !== 'view' || hasFlippedOnce

  // Ensure we only navigate back once even if multiple state transitions happen.
  const didNavigateBackRef = React.useRef(false)

  const safeBack = React.useCallback(() => {
    if (didNavigateBackRef.current) return
    didNavigateBackRef.current = true
    handleBackPress()
  }, [handleBackPress])

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
    <>
      <Layout
      levelId={route?.params?.levelId || 1}
      onBackPress={mode === 'learn' ? handleExitLearning : handleBackPress}
      lessonsLearned={30}
      streakDays={30}
    >
      {mode === 'list' ? (
        <List 
          topicId={topicId}
          onStartLearning={handleStartLearning}
          onStartStudy={handleStartStudy}
        />
      ) : (
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
          onBackPress={handleExitLearning}
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
      )}
    </Layout>
    {Platform.OS !== 'web' && mode === 'list' && <NavbarMobile />}
  </>
)
}

export default FlashcardFirstLearnScreen



