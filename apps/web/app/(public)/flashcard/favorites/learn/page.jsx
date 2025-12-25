'use client'

import { useRouter } from 'next/navigation'
import LearnScreen from 'app/features/study/flashcard-learn'
import { STUDY_PAGE_TITLES } from 'app/features/study/constants'

export default function FlashcardFavoritesLearnPage() {
  const router = useRouter()

  return (
    <LearnScreen
      topicId={null}
      isFavoritesMode={true}
      title="Học Từ Vựng Yêu Thích"
      onBackPress={() => router.push('/flashcard/favorites')}
    />
  )
}

