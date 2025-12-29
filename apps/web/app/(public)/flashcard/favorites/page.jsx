'use client'

import { useRouter } from 'next/navigation'
import FlashcardStudyScreen from '@tokki/app/features/study/flashcard-study'
import { STUDY_PAGE_TITLES } from '@tokki/app/features/study/constants'

export default function FlashcardFavoritesPage() {
  const router = useRouter()

  return (
    <FlashcardStudyScreen
      title="Từ vựng yêu thích"
      topicId={null}
      isFavoritesMode={true}
      onBackPress={() => router.push('/flashcard')}
      onLearnPress={() => {
        router.push('/flashcard/favorites/learn')
      }}
      onTestPress={() => {
        router.push('/flashcard/favorites/test')
      }}
      onFavoritesPress={undefined}
    />
  )
}

