'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardStudy } from './useFlashcardStudy'
import { FLASHCARDS } from '../../mockData'
import { 
  FlashcardStudyLayout as WebLayout,
  FlashcardStudyMain as WebMain,
  FlashcardStudyLayoutMobile as MobileLayout,
  FlashcardStudyMainMobile as MobileMain
} from '../../components/flashcard/flashcard-study'

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
    current,
    isFavorite,
    handleNext,
    handlePrev,
    handleSelectFlashcard,
    toggleFavorite,
    setIsFlipped,
  } = useFlashcardStudy()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        title={title}
        current={current}
        currentIndex={index}
        total={FLASHCARDS.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        favorites={favorites}
        onBackPress={onBackPress}
        onLearnPress={onLearnPress}
        onTestPress={onTestPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onNext={handleNext}
        onPrev={handlePrev}
        onSelectFlashcard={handleSelectFlashcard}
      />
    </Layout>
  )
}

export default FlashcardStudyScreen
