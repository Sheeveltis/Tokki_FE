'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useAlphabetTyping } from './useAlphabetTyping'
import { 
  AlphabetTypingLayout as WebLayout,
  AlphabetTypingMain as WebMain,
  AlphabetTypingLayoutMobile as MobileLayout,
  AlphabetTypingMainMobile as MobileMain
} from '../../components/alphabet/alphabet-typing'

/**
 * AlphabetTypingScreen: Trang tập đánh chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetTypingScreen({
  onBackPress,
}) {
  const {
    index,
    userInput,
    isCorrect,
    score,
    attempts,
    showInstructions,
    current,
    inputRef,
    handleNext,
    handlePrev,
    handleInputChange,
    handleCheck,
    handleKeyPress,
    handleVirtualKeyPress,
    setShowInstructions,
  } = useAlphabetTyping()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        current={current}
        currentIndex={index}
        userInput={userInput}
        isCorrect={isCorrect}
        score={score}
        attempts={attempts}
        showInstructions={showInstructions}
        inputRef={inputRef}
        onBackPress={onBackPress}
        onInputChange={handleInputChange}
        onCheck={handleCheck}
        onKeyPress={handleKeyPress}
        onVirtualKeyPress={handleVirtualKeyPress}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleInstructions={() => setShowInstructions(!showInstructions)}
      />
    </Layout>
  )
}

export default AlphabetTypingScreen
