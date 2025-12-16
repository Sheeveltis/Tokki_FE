'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import MatchingCardResultScreen from 'app/features/minigame/matching-card/matching-card-resulft/matching-card-result-screen'

export default function MatchingCardResultPage({ searchParams }) {
  const router = useRouter()

  const topicId = searchParams?.topic || 'life'
  const topicName = searchParams?.topicName
  const score = Number(searchParams?.score || 0)
  const topPercent = Number(searchParams?.top || 5)

  const handleReplay = () => {
    const query = new URLSearchParams()
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    router.push(`/minigame/matching-card?${query.toString()}`)
  }

  return (
    <MatchingCardResultScreen
      topicId={topicId}
      topicName={topicName}
      score={score}
      topPercent={topPercent}
      onBack={handleReplay}
    />
  )
}
