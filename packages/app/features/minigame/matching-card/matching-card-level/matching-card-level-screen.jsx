import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { MatchingCardLevelLayoutWeb } from './components/matching-card-level-layout.web'
import { hasPlayedLevel, mapLevelToDifficulty } from '../matching-card-play/api/api'

/**
 * Screen chọn mức độ cho matching card
 */
export default function MatchingCardLevelScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams?.get('topic') || ''
  const topicName = searchParams?.get('topicName') || ''
  const levelId = searchParams?.get('level') || ''

  const [selectedId, setSelectedId] = useState(null)

  const handleConfirm = async (level) => {
    const levelIdValue = level?.id || selectedId || 'medium'
    const gameId = searchParams?.get('gameId') || '' // Lấy gameId từ URL params

    // Map levelId to gameDifficulty (1=dễ, 2=trung bình, 3=khó)
    const gameDifficulty = mapLevelToDifficulty(levelIdValue)

    // Check if user has played this level before
    let hasPlayed = false
    if (gameId && topicId) {
      try {
        hasPlayed = await hasPlayedLevel(gameId, topicId, gameDifficulty)
        console.log('[MatchingCardLevelScreen] hasPlayedLevel result:', hasPlayed)
      } catch (error) {
        console.error('[MatchingCardLevelScreen] Error checking hasPlayedLevel:', error)
        // Default to false if error
        hasPlayed = false
      }
    }

    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelIdValue)
    query.set('hasPlayed', String(hasPlayed)) // Lưu flag để biết dùng POST hay PUT

    router.push(`/minigame/matching-card/matching-card-play?${query.toString()}`)
  }

  return (
    <MatchingCardLevelLayoutWeb
      topicId={topicId}
      topicName={topicName}
      levelId={levelId}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onConfirm={handleConfirm}
    />
  )
}

