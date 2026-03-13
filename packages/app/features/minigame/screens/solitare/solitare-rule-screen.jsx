import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { SolitareRuleLayoutWeb } from '../../components/solitare/solitare-rule/solitare-rule-layout.web'
import { SolitareLevelPopup } from '../../components/solitare/solitare-level/solitare-level-popup'

/**
 * Screen wrapper cho trang luật chơi solitaire.
 * Có thể nhận levelId từ props nếu cần trong tương lai.
 * @param {{ levelId?: string | number }} props
 */
export function SolitareRuleScreen({ levelId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams?.get('gameId') || '' // Lấy gameId từ URL params nếu có
  const [levelPopupVisible, setLevelPopupVisible] = useState(false)
  const [selectedLevelId, setSelectedLevelId] = useState(levelId || 'medium')

  const handleStart = () => {
    // Hiện popup chọn mức độ khi bấm nút "Chọn độ khó"
    setLevelPopupVisible(true)
  }

  const handleClosePopup = () => {
    setLevelPopupVisible(false)
  }

  const handleConfirmLevel = (level) => {
    const nextLevelId = level || selectedLevelId || 'medium'
  
    console.log('[RuleScreen] selected level =', nextLevelId)
  
    setSelectedLevelId(nextLevelId)
    setLevelPopupVisible(false)
  
    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (nextLevelId) query.set('level', String(nextLevelId))
  
    const url =
      query.toString().length > 0
        ? `/minigame/solitare/solitare-play?${query.toString()}`
        : '/minigame/solitare/solitare-play'
  
    router.push(url)
  }

  return (
    <>
      <SolitareRuleLayoutWeb onStart={handleStart} />
      <SolitareLevelPopup
        visible={levelPopupVisible}
        onClose={handleClosePopup}
        onConfirm={handleConfirmLevel}
      />
    </>
  )
}


