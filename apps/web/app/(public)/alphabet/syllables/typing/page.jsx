'use client'

import { useRouter } from 'next/navigation'
import AlphabetTypingScreen from 'app/features/study/screens/AlphabetTyping'

export default function AlphabetSyllablesTypingPage() {
  const router = useRouter()

  return (
    <AlphabetTypingScreen
      onBackPress={() => router.push('/alphabet/syllables')}
    />
  )
}


