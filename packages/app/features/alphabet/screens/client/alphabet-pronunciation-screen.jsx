'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useAlphabetPronunciation } from '../../api/alphabet-pronunciation-logic'
import { 
  AlphabetPronunciationLayout as WebLayout,
  AlphabetPronunciationMain as WebMain,
  AlphabetPronunciationLayoutMobile as MobileLayout,
  AlphabetPronunciationMainMobile as MobileMain
} from '../../api/alphabet-pronunciation-index'

/**
 * AlphabetPronunciationScreen: Trang tập phát âm chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetPronunciationScreen({
  onBackPress,
}) {
  const {
    index,
    isPlaying,
    current,
    handleNext,
    handlePrev,
    handlePlay,
  } = useAlphabetPronunciation()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        current={current}
        currentIndex={index}
        isPlaying={isPlaying}
        onBackPress={onBackPress}
        onPlay={handlePlay}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </Layout>
  )
}

export default AlphabetPronunciationScreen
