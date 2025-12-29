'use client'

import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const HomeScreen = dynamic(
  () => import('@tokki/app/features/home/screen').then(mod => mod.HomeScreen),
  { ssr: false }
)

export default function Page() {
  const router = useRouter()

  return (
    <HomeScreen 
      onHomePress={() => router.push('/')}
      onRoadmapPress={() => router.push('/roadmap')}
      onFlashcardPress={() => router.push('/flashcard')}
      onBlogPress={() => router.push('/blog')}
      onProfilePress={() => router.push('/profile')}
    />
  )
}