'use client'

import React from 'react'
import { MenuStudyLayout, MenuStudyMain } from '../../components/menu-study'
import { useRouter } from 'next/navigation'

/**
 * MenuStudy: Trang menu học tập cho từng level
 * @param {{
 *   levelId?: number
 *   onBackPress?: () => void
 *   onQuickTestPress?: () => void
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function MenuStudy({
  levelId = 1,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
}) {
  const router = useRouter()

  const handleModulePress = (moduleId) => {
    if (moduleId === 'vocabulary') {
      router.push('/flashcard')
      return
    }
    if (moduleId === 'alphabet') {
      router.push('/alphabet')
      return
    }
  }

  return (
    <MenuStudyLayout
      levelId={levelId}
      onBackPress={onBackPress}
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={streakDays}
    >
      <MenuStudyMain levelId={levelId} onModulePress={handleModulePress} />
    </MenuStudyLayout>
  )
}

export default MenuStudy

