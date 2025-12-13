'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import LearnScreen from 'app/features/study/screens/Learn'
import { STUDY_PAGE_TITLES, TOPIC_TITLES } from 'app/features/study/constants'

export default function FlashcardLearnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const topicId = searchParams?.get('topic') || ''
  const topicTitle = topicId ? TOPIC_TITLES[topicId] || STUDY_PAGE_TITLES.FLASHCARD_STUDY : STUDY_PAGE_TITLES.FLASHCARD_STUDY

  return (
    <LearnScreen
      topicId={topicId}
      title={`Học ${topicTitle}`}
      onBackPress={() => router.push(`/flashcard/study?topic=${topicId}`)}
    />
  )
}

