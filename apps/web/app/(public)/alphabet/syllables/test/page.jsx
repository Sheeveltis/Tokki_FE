'use client'

import { useRouter } from 'next/navigation'
import AlphabetTestScreen from 'app/features/study/alphabet-test'

export default function AlphabetSyllablesTestPage() {
  const router = useRouter()

  return (
    <AlphabetTestScreen
      onBackPress={() => router.push('/alphabet/syllables')}
      onClose={() => router.push('/alphabet/syllables')}
    />
  )
}




