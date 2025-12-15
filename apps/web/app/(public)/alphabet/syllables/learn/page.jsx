'use client'

import { useRouter } from 'next/navigation'
import AlphabetLearnScreen from 'app/features/study/alphabet-learn'

export default function AlphabetSyllablesLearnPage() {
  const router = useRouter()

  return (
    <AlphabetLearnScreen
      onBackPress={() => router.push('/alphabet/syllables')}
    />
  )
}




