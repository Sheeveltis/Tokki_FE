'use client'

import React from 'react'
import MatchingCardScreen from 'app/features/minigame/matching-card/matching-card-play/matching-card-screen'

export default function MatchingCardPage({ searchParams }) {
  const topicId = searchParams?.topic || ''
  const topicName = searchParams?.topicName
  const levelId = searchParams?.level || 'medium'
  const quantity = searchParams?.quantity ? Number(searchParams.quantity) : null
  
  console.log('MatchingCardPage - searchParams:', { topic: searchParams?.topic, topicName, level: searchParams?.level, quantity: searchParams?.quantity })
  console.log('MatchingCardPage - parsed:', { topicId, topicName, levelId, quantity })
  
  // Don't render if topicId is missing
  if (!topicId || topicId === '') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Vui lòng chọn chủ đề trước khi chơi</p>
      </div>
    )
  }
  
  return <MatchingCardScreen topicId={topicId} topicName={topicName} levelId={levelId} quantity={quantity} />
}
