'use client'

import { useRouter } from 'next/navigation'
import { HomeScreen } from 'app/features/home/screen'

export default function HomePage() {
  const router = useRouter()

  return (
    <HomeScreen
      onHomePress={() => router.push('/homepage')}
      onRoadmapPress={() => router.push('/roadmap')}
      onFlashcardPress={() => router.push('/flashcard')}
      onBlogPress={() => router.push('/blog')}
      onProfilePress={() => router.push('/profile')}
    />
  )
}

