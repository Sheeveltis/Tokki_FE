'use client'

import { useRouter } from 'next/navigation'
import TestScreen from 'app/features/study/flashcard-test'
import { STUDY_PAGE_TITLES } from 'app/features/study/constants'

export default function FlashcardFavoritesTestPage() {
  const router = useRouter()

  return (
    <TestScreen
      topicId={null}
      isFavoritesMode={true}
      title="Kiểm tra Từ Vựng Yêu Thích"
      onBackPress={() => router.push('/flashcard/favorites')}
      onClose={() => router.push('/flashcard/favorites')}
    />
  )
}

