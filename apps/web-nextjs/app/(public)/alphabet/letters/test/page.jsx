'use client'

import { useRouter } from 'next/navigation'
import AlphabetTestScreen from '@tokki/app/features/study/alphabet-test'

export default function AlphabetLettersTestPage() {
  const router = useRouter()

  return (
    <AlphabetTestScreen
      onBackPress={() => router.push('/alphabet/letters')}
      onClose={() => router.push('/alphabet/letters')}
    />
  )
}




