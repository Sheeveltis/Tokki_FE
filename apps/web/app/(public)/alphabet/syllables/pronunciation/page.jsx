'use client'

import { useRouter } from 'next/navigation'
import AlphabetPronunciationScreen from 'app/features/study/alphabet-pronunciation'

export default function AlphabetSyllablesPronunciationPage() {
  const router = useRouter()

  return (
    <AlphabetPronunciationScreen
      onBackPress={() => router.push('/alphabet/syllables')}
    />
  )
}




