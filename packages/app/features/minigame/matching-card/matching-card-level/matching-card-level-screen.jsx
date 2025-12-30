import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { MatchingCardLevelLayoutWeb } from './components/matching-card-level-layout.web'

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

  const handleConfirm = (level) => {
    const levelIdValue = level?.id || selectedId || 'medium'

    const query = new URLSearchParams()
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelIdValue)

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

