'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import FlashcardStudyScreen from '@tokki/app/features/study/flashcard-study'
import { STUDY_PAGE_TITLES, TOPIC_TITLES } from '@tokki/app/features/study/constants'

export default function FlashcardStudyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams?.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <FlashcardStudyScreen
      title={topicTitle}
      topicId={topicId}
      onBackPress={() => router.push('/flashcard')}
      onLearnPress={() => {
        router.push(`/flashcard/learn?topic=${topicId}`)
      }}
      onTestPress={() => {
        router.push(`/flashcard/test?topic=${topicId}`)
      }}
      onFavoritesPress={() => {
        router.push('/flashcard/favorites')
      }}
    />
  )
}


