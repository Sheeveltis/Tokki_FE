'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardStudy } from './useFlashcardStudy'
import { FLASHCARDS } from '../mockData'
import { 
  FlashcardStudyLayout as WebLayout,
  FlashcardStudyMain as WebMain,
  FlashcardStudyLayoutMobile as MobileLayout,
  FlashcardStudyMainMobile as MobileMain
} from './components'

/**
 * FlashcardStudyScreen: Trang học flashcard
 * Điều phối giữa web và mobile layout
 */
export function FlashcardStudyScreen({
  title = 'Flashcard',
  onBackPress,
  onLearnPress,
  onTestPress,
}) {
  const {
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
  } = useFlashcardStudy()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        title={title}
        current={current}
        currentIndex={currentIndex}
        total={FLASHCARDS.length}
        unlearnedCount={unlearnedFlashcards.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        favorites={favorites}
        onBackPress={onBackPress}
        onLearnPress={onLearnPress}
        onTestPress={onTestPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelectFlashcard={handleSelectFlashcard}
        onMarkAsLearned={markAsLearned}
        onMarkAsNeedReview={markAsNeedReview}
        onResetAllLearned={resetAllLearned}
      />
    </Layout>
  )
}

export default FlashcardStudyScreen
