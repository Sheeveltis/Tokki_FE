'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useAlphabetStudy } from '../../api/alphabet-study-logic'
import { 
  AlphabetStudyLayout,
  AlphabetStudyMain
} from '../../api/alphabet-study-index'

/**
 * AlphabetStudyScreen: Trang học chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetStudyScreen({
  mode = 'letters', // 'letters' hoặc 'syllables'
  onBackPress,
  onLearnPress,
  onPronunciationPress,
  onTypingPress,
  onDrawingPress,
  onTestPress,
}) {
  const {
    index,
    isFlipped,
    favorites,
    data,
    current,
    isFavorite,
    modeTitle,
    handleNext,
    handlePrev,
    handleSelectLetter,
    toggleFavorite,
    setIsFlipped,
  } = useAlphabetStudy(mode)

  return (
    <AlphabetStudyLayout>
      <AlphabetStudyMain
        modeTitle={modeTitle}
        current={current}
        currentIndex={index}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        data={data}
        favorites={favorites}
        onBackPress={onBackPress}
        onLearnPress={onLearnPress}
        onPronunciationPress={onPronunciationPress}
        onTypingPress={onTypingPress}
        onDrawingPress={onDrawingPress}
        onTestPress={onTestPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onSelectFlashcard={handleSelectLetter}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </AlphabetStudyLayout>
  )
}

export default AlphabetStudyScreen

