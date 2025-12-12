'use client'

import React from 'react'
import { StudyLayout } from '../../components/study-layout.web'
import { StudyMain } from '../../components/study-main.web'

/**
 * StudySelection: Trang chọn lộ trình học dựa trên các level
 * - Hiển thị menu 6 level
 * - Hỗ trợ callback khi chọn level
 * @param {{
 *   onSelectLevel?: (levelId: number) => void
 *   onQuickTestPress?: () => void
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function StudySelection({ onSelectLevel, onQuickTestPress, lessonsLearned, streakDays }) {
  return (
    <StudyLayout
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={streakDays}
    >
      <StudyMain onSelectLevel={onSelectLevel} />
    </StudyLayout>
  )
}

export default StudySelection

