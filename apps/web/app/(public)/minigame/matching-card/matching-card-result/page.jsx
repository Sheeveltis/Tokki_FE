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
  const timeLeft = Number(searchParams?.time || 0)

  const handleReplay = () => {
    router.push('/minigame')
  }

  return (
    <MatchingCardResultScreen
      topicId={topicId}
      topicName={topicName}
      score={score}
      topPercent={topPercent}
      timeLeft={timeLeft}
      onBack={handleReplay}
    />
  )
}
