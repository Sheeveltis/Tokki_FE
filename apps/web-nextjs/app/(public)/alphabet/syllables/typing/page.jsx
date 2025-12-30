'use client'

import { useRouter } from 'next/navigation'
import AlphabetTypingScreen from '@tokki/app/features/study/alphabet-typing'

export default function AlphabetSyllablesTypingPage() {
  const router = useRouter()

  return (
    <AlphabetTypingScreen
      onBackPress={() => router.push('/alphabet/syllables')}
    />
  )
}




