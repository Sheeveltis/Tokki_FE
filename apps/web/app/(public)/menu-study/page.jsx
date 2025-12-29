'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { MenuStudy } from '@tokki/app/features/study/menu-study'

export default function MenuStudyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelId = parseInt(searchParams?.get('level') || '1', 10)

  return (
    <MenuStudy
      levelId={levelId}
      onBackPress={() => router.push('/study')}
      onQuickTestPress={() => router.push('/test')}
      lessonsLearned={30}
      streakDays={30}
    />
  )
}

