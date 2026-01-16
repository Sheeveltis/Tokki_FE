import React from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { AlphabetDrawingLayout as AlphabetDrawingLayoutWeb } from '../../components/alphabet-drawing/alphabet-drawing-layout.web'
import { AlphabetDrawingLayout as AlphabetDrawingLayoutMobile } from '../../components/alphabet-drawing/alphabet-drawing-layout.mobile'
import { AlphabetDrawingMain as AlphabetDrawingMainWeb } from '../../components/alphabet-drawing/alphabet-drawing-main.web'
import { AlphabetDrawingMain as AlphabetDrawingMainMobile } from '../../components/alphabet-drawing/alphabet-drawing-main.mobile'

/**
 * AlphabetDrawingScreen: màn hình tập vẽ chữ cái Hàn Quốc
 * - Web: dùng AlphabetDrawingLayoutWeb + AlphabetDrawingMainWeb
 * - Mobile: dùng AlphabetDrawingLayoutMobile + AlphabetDrawingMainMobile
 */
export function AlphabetDrawingScreen({ onBackPress }) {
  const router = useRouter()

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  if (Platform.OS === 'web') {
    return (
      <AlphabetDrawingLayoutWeb>
        <AlphabetDrawingMainWeb onBackPress={handleBack} />
      </AlphabetDrawingLayoutWeb>
    )
  }

  return (
    <AlphabetDrawingLayoutMobile>
      <AlphabetDrawingMainMobile onBackPress={handleBack} />
    </AlphabetDrawingLayoutMobile>
  )
}

export default AlphabetDrawingScreen



