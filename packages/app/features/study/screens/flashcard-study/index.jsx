'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardStudy } from './useFlashcardStudy'
import { 
  FlashcardStudyLayout as WebLayout,
  FlashcardStudyMain as WebMain,
  FlashcardStudyLayoutMobile as MobileLayout,
  FlashcardStudyMainMobile as MobileMain
} from './components'

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

/**
 * FlashcardStudyScreen: Trang học flashcard
 * Điều phối giữa web và mobile layout
 */
export function FlashcardStudyScreen({
  title = 'Flashcard',
  onBackPress: onBackPressProp,
  onLearnPress,
  onTestPress,
  onQuizPress,
  onFavoritesPress,
  topicId: topicIdProp,
  isFavoritesMode = false,
  route: routeProp,
  navigation: navigationProp,
}) {
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
  
  // Lấy isFavoritesMode từ route params hoặc props
  const favoritesMode = route?.params?.isFavoritesMode ?? isFavoritesMode
  
  // Đặt title mặc định cho favorites mode
  const screenTitle = favoritesMode && title === 'Flashcard' 
    ? 'Từ vựng yêu thích' 
    : title

  // Handler cho nút back
  const handleBackPress = () => {
    if (onBackPressProp) {
      onBackPressProp()
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack()
    }
  }
  const {
    flashcards,
    index,
    isFlipped,
    favorites,
    learned,
    unlearnedFlashcards,
    current,
    currentIndex,
    isFavorite,
    isLearned,
    handleNext,
    handlePrev,
    handleSelectFlashcard,
    toggleFavorite,
    markAsLearned,
    markAsNeedReview,
    resetAllLearned,
    setIsFlipped,
    loading,
    error,
    fetchFlashcards,
  } = useFlashcardStudy(topicId, favoritesMode)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  if (Platform.OS === 'web') {
    return (
      <Main
        title={screenTitle}
        flashcards={flashcards}
        current={current}
        currentIndex={currentIndex}
        total={flashcards.length}
        unlearnedCount={unlearnedFlashcards.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        favorites={favorites}
        onBackPress={handleBackPress}
        onTestPress={onTestPress}
        onFavoritesPress={onFavoritesPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelectFlashcard={handleSelectFlashcard}
        onMarkAsLearned={markAsLearned}
        onMarkAsNeedReview={markAsNeedReview}
        onResetAllLearned={resetAllLearned}
        loading={loading}
        error={error}
        onRetry={fetchFlashcards}
        isFavoritesMode={favoritesMode}
      />
    )
  }

  return (
    <Layout
      levelId={route?.params?.levelId || 1}
      onBackPress={handleBackPress}
      lessonsLearned={30} // Fallback value
      streakDays={30} // Fallback value
      onTestPress={onTestPress}
      onFavoritesPress={onFavoritesPress}
    >
      <Main
        title={screenTitle}
        flashcards={flashcards}
        current={current}
        currentIndex={currentIndex}
        total={flashcards.length}
        unlearnedCount={unlearnedFlashcards.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        favorites={favorites}
        onBackPress={handleBackPress}
        onTestPress={onTestPress}
        onFavoritesPress={onFavoritesPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelectFlashcard={handleSelectFlashcard}
        onMarkAsLearned={markAsLearned}
        onMarkAsNeedReview={markAsNeedReview}
        onResetAllLearned={resetAllLearned}
        loading={loading}
        error={error}
        onRetry={fetchFlashcards}
        isFavoritesMode={favoritesMode}
      />
    </Layout>
  )
}

export default FlashcardStudyScreen
