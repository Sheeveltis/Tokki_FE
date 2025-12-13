'use client'

import { useRouter } from 'next/navigation'
import AlphabetTestScreen from 'app/features/study/screens/AlphabetTest'

export default function AlphabetLettersTestPage() {
  const router = useRouter()

  return (
    <AlphabetTestScreen
      onBackPress={() => router.push('/alphabet/letters')}
      onClose={() => router.push('/alphabet/letters')}
    />
  )
}


