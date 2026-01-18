'use client'

import React from 'react'
import { Platform } from 'react-native'
import { 
  AlphabetSelectModeLayout as WebLayout,
  AlphabetSelectModeMain as WebMain,
  AlphabetSelectModeLayoutMobile as MobileLayout,
  AlphabetSelectModeMainMobile as MobileMain
} from '../../api/alphabet-select-mode-index'

/**
 * AlphabetSelectModeScreen: Màn hình chọn học phần (chữ cái hoặc ghép âm)
 * Điều phối giữa web và mobile layout
 */
export function AlphabetSelectModeScreen({
  onBackPress,
  onLettersPress,
  onSyllablesPress,
}) {
  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        onBackPress={onBackPress}
        onLettersPress={onLettersPress}
        onSyllablesPress={onSyllablesPress}
              />
    </Layout>
  )
}

export default AlphabetSelectModeScreen
