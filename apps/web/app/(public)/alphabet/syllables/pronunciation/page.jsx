'use client'

import { useRouter } from 'next/navigation'
import AlphabetPronunciationScreen from 'app/features/study/screens/AlphabetPronunciation'

export default function AlphabetSyllablesPronunciationPage() {
  const router = useRouter()

  return (
    <AlphabetPronunciationScreen
      onBackPress={() => router.push('/alphabet/syllables')}
    />
  )
}


