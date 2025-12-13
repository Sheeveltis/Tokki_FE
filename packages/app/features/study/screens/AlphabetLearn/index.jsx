'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useAlphabetLearn } from './useAlphabetLearn'
import { ALPHABET_LETTERS } from '../../mockData'
import { 
  AlphabetLearnLayout as WebLayout,
  AlphabetLearnMain as WebMain,
  AlphabetLearnLayoutMobile as MobileLayout,
  AlphabetLearnMainMobile as MobileMain
} from '../../components/alphabet/alphabet-learn'

/**
 * AlphabetLearnScreen: Trang học chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetLearnScreen({
  onBackPress,
}) {
  const {
    index,
    isFlipped,
    learned,
    current,
    isFavorite,
    isLearned,
    progress,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    setIsFlipped,
  } = useAlphabetLearn()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        current={current}
        currentIndex={index}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        progress={progress}
        learnedCount={learned.size}
        total={ALPHABET_LETTERS.length}
        onBackPress={onBackPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onMarkAsLearned={markAsLearned}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </Layout>
  )
}

export default AlphabetLearnScreen
