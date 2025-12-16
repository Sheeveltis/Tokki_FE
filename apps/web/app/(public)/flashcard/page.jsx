'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import FlashcardListScreen from 'app/features/study/flashcard-list'
import { STUDY_PAGE_TITLES } from 'app/features/study/constants'

export default function FlashcardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelId = parseInt(searchParams?.get('level') || '1', 10)

  return (
    <FlashcardListScreen
      levelId={levelId}
      onTopicPress={(topicId) => {
        // Điều hướng sang trang học flashcard
        router.push(`/flashcard/study?topic=${topicId}`)
      }}
      onBackPress={() => router.push(`/menu-study?level=${levelId}`)}
      title={STUDY_PAGE_TITLES.FLASHCARD_LIST}
    />
  )
}


