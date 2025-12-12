'use client'

import { useRouter } from 'next/navigation'
import FlashcardListScreen from 'app/features/study/screens/FlashcardList'
import { STUDY_PAGE_TITLES } from 'app/features/study/constants'

export default function FlashcardPage() {
  const router = useRouter()

  return (
    <FlashcardListScreen
      onTopicPress={(topicId) => {
        // Điều hướng sang trang học flashcard
        router.push(`/flashcard/study?topic=${topicId}`)
      }}
      onBackPress={() => router.push('/menu-study')}
      title={STUDY_PAGE_TITLES.FLASHCARD_LIST}
    />
  )
}


