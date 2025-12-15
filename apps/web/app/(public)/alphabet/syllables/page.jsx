'use client'

import { useRouter } from 'next/navigation'
import AlphabetStudyScreen from 'app/features/study/alphabet-study'

export default function AlphabetSyllablesPage() {
  const router = useRouter()

  return (
    <AlphabetStudyScreen
      mode="syllables"
      onBackPress={() => router.push('/alphabet')}
      onLearnPress={() => router.push('/alphabet/syllables/learn')}
      onPronunciationPress={() => router.push('/alphabet/syllables/pronunciation')}
      onTypingPress={() => router.push('/alphabet/syllables/typing')}
      onTestPress={() => router.push('/alphabet/syllables/test')}
    />
  )
}




