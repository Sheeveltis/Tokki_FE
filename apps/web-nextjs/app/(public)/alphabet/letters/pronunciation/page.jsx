'use client'

import { useRouter } from 'next/navigation'
import AlphabetPronunciationScreen from '@tokki/app/features/study/alphabet-pronunciation'

export default function AlphabetLettersPronunciationPage() {
  const router = useRouter()

  return (
    <AlphabetPronunciationScreen
      onBackPress={() => router.push('/alphabet/letters')}
    />
  )
}


