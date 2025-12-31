import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { MatchingCardTopicLayoutWeb } from './components/matching-card-topic-layout.web'
import { MatchingCardLevelPopup } from '../matching-card-level/components/matching-card-level-popup'

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

  const handleLevelConfirm = (level) => {
    // Đóng popup
    setShowLevelPopup(false)

    // Lấy topicId và topicName từ topic đã chọn
    const topicId = selectedTopic?.id
    const topicName = selectedTopic?.titleKo
    const levelIdValue = level?.id || 'medium'
    const quantity = level?.quantity || 10

    // Navigate trực tiếp đến play với topicId và quantity
    const query = new URLSearchParams()
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelIdValue)
    query.set('quantity', String(quantity))

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


