'use client'

import { useRouter } from 'next/navigation'
import { StudyScreen } from 'app/features/study/screen'
import { STUDY_PAGE_TITLES } from 'app/features/study/constants'

export default function StudyPage() {
  const router = useRouter()

  return (
    <StudyScreen
      title={STUDY_PAGE_TITLES.STUDY}
      onSelectLevel={(levelId) => {
        router.push(`/menu-study?level=${levelId}`)
      }}
      onQuickTestPress={() => {
        router.push('/test')
      }}
      lessonsLearned={30}
      streakDays={30}
    />
  )
}

