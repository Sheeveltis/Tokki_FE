'use client'

import React from 'react'
import MatchingCardScreen from 'app/features/minigame/matching-card/matching-card-play/matching-card-screen'

export default function MatchingCardPage({ searchParams }) {
  const topicId = searchParams?.topic || 'life'
  const topicName = searchParams?.topicName
  return <MatchingCardScreen topicId={topicId} topicName={topicName} />
}
