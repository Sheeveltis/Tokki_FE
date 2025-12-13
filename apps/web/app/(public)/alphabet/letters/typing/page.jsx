'use client'

import { useRouter } from 'next/navigation'
import AlphabetTypingScreen from 'app/features/study/screens/AlphabetTyping'

export default function AlphabetLettersTypingPage() {
  const router = useRouter()

  return (
    <AlphabetTypingScreen
      onBackPress={() => router.push('/alphabet/letters')}
    />
  )
}


