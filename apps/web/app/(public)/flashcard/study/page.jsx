'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import FlashcardStudyScreen from 'app/features/study/screens/FlashcardStudy'
import { STUDY_PAGE_TITLES, TOPIC_TITLES } from 'app/features/study/constants'

export default function FlashcardStudyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams?.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <FlashcardStudyScreen
      title={topicTitle}
      onBackPress={() => router.push('/flashcard')}
      onLearnPress={() => {
        router.push(`/flashcard/learn?topic=${topicId}`)
      }}
      onTestPress={() => {
        router.push(`/flashcard/test?topic=${topicId}`)
      }}
    />
  )
}


