import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { MatchingCardTopicLayoutWeb } from '../../components/matching-card/matching-card-topic/matching-card-topic-layout.web'
import { MatchingCardLevelPopup } from '../../components/matching-card/matching-card-level/matching-card-level-popup'
import { hasPlayedLevel, mapLevelToDifficulty } from '../../api/matching-card-play-api'

/**
 * Screen chọn chủ đề cho matching card
 */
export default function MatchingCardTopicScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelId = searchParams?.get('level') || ''

  const [selectedId, setSelectedId] = useState(null)
  const [showLevelPopup, setShowLevelPopup] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)

  const handleTopicConfirm = (topic) => {
    console.log('[MatchingCardTopicScreen] handleTopicConfirm called with topic:', topic)
    // Lưu topic đã chọn và mở popup level
    setSelectedTopic(topic)
    setShowLevelPopup(true)
    console.log('[MatchingCardTopicScreen] Popup should be visible now')
  }

  const handleLevelConfirm = async (level) => {
    // Đóng popup
    setShowLevelPopup(false)

    // Lấy topicId và topicName từ topic đã chọn
    const topicId = selectedTopic?.id
    const topicName = selectedTopic?.titleKo
    const levelIdValue = level?.id || 'medium'
    const quantity = level?.quantity || 10
    const gameId = searchParams?.get('gameId') || '' // Lấy gameId từ URL params

    // Map levelId to gameDifficulty (1=dễ, 2=trung bình, 3=khó)
    const gameDifficulty = mapLevelToDifficulty(levelIdValue)

    // Check if user has played this level before
    let hasPlayed = false
    if (gameId && topicId) {
      try {
        hasPlayed = await hasPlayedLevel(gameId, topicId, gameDifficulty)
        console.log('[MatchingCardTopicScreen] hasPlayedLevel result:', hasPlayed)
      } catch (error) {
        console.error('[MatchingCardTopicScreen] Error checking hasPlayedLevel:', error)
        // Default to false if error
        hasPlayed = false
      }
    }

    // Navigate đến play với topicId, quantity, và hasPlayed flag
    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelIdValue)
    query.set('quantity', String(quantity))
    query.set('hasPlayed', String(hasPlayed)) // Lưu flag để biết dùng POST hay PUT

    router.push(`/minigame/matching-card/matching-card-play?${query.toString()}`)
  }

  const handleLevelClose = () => {
    setShowLevelPopup(false)
  }

  return (
    <>
      <MatchingCardTopicLayoutWeb
        levelId={levelId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onConfirm={handleTopicConfirm}
      />
      <MatchingCardLevelPopup
        visible={showLevelPopup}
        onClose={handleLevelClose}
        onConfirm={handleLevelConfirm}
      />
    </>
  )
}


