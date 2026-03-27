'use client'

import React, { useState } from 'react'
import { StudyLayout } from '@tokki/app/features/study/components/study-layout.web'
import { StudyMain } from '@tokki/app/features/study/components/study-main.web'
import { useRouter } from 'solito/navigation'

/**
 * StudyScreen: Trang chọn lộ trình học dựa trên các level
 * - Hiển thị menu 6 level
 * - Hỗ trợ callback khi chọn level
 * @param {{
 *   onSelectLevel?: (levelId: number) => void
 *   onQuickTestPress?: () => void
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function StudyScreen({ onSelectLevel, onQuickTestPress, lessonsLearned, streakDays }) {
  const router = useRouter()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleShowModal = (levelId) => {
    setSelectedLevel(levelId)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedLevel(null)
  }

  const handleContinueStudy = () => {
    setShowModal(false)
    if (selectedLevel && onSelectLevel) {
      onSelectLevel(selectedLevel)
    }
    setSelectedLevel(null)
  }

  const handleTest = () => {
    setShowModal(false)
    setSelectedLevel(null)
    router.push('/roadmap/info')
  }

  return (
    <StudyLayout
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={streakDays}
      modalState={{ showModal, selectedLevel }}
      onModalClose={handleCloseModal}
      onModalContinue={handleContinueStudy}
      onModalTest={handleTest}
    >
      <StudyMain onSelectLevel={onSelectLevel} onShowModal={handleShowModal} />
    </StudyLayout>
  )
}

export default StudyScreen


