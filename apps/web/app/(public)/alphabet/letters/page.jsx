'use client'

import { useRouter } from 'next/navigation'
import AlphabetStudyScreen from 'app/features/study/screens/AlphabetStudy'

export default function AlphabetLettersPage() {
  const router = useRouter()

  return (
    <AlphabetStudyScreen
      mode="letters"
      onBackPress={() => router.push('/alphabet')}
      onLearnPress={() => router.push('/alphabet/letters/learn')}
      onPronunciationPress={() => router.push('/alphabet/letters/pronunciation')}
      onTypingPress={() => router.push('/alphabet/letters/typing')}
      onTestPress={() => router.push('/alphabet/letters/test')}
    />
  )
}




