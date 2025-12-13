'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import TestScreen from 'app/features/study/screens/FlashcardTest'
import { STUDY_PAGE_TITLES, TOPIC_TITLES } from 'app/features/study/constants'

export default function FlashcardTestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams?.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <TestScreen
      topicId={topicId}
      title={`Kiểm tra ${topicTitle}`}
      onBackPress={() => router.push(`/flashcard/study?topic=${topicId}`)}
      onClose={() => router.push(`/flashcard/study?topic=${topicId}`)}
    />
  )
}


