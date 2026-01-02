import React from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { MatchingCardRuleLayoutWeb } from './components/matching-card-rule-layout.web'

/**
 * Screen wrapper cho trang luật chơi matching-card.
 * @param {{ levelId?: string | number }} props
 */
export default function MatchingCardRuleScreen({ levelId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams?.get('gameId') || '' // Lấy gameId từ URL params

  const handleSelectTopic = () => {
    // Điều hướng sang trang chọn chủ đề matching-card, giữ lại level và gameId nếu có
    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (levelId !== undefined && levelId !== null && levelId !== '') {
      query.set('level', String(levelId))
    }

    const url =
      query.toString().length > 0
        ? `/minigame/matching-card/matching-card-topic?${query.toString()}`
        : '/minigame/matching-card/matching-card-topic'

    router.push(url)
  }

  return <MatchingCardRuleLayoutWeb onSelectTopic={handleSelectTopic} />
}

