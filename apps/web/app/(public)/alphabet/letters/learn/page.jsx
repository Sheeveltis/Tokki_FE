'use client'

import { useRouter } from 'next/navigation'
import AlphabetLearnScreen from 'app/features/study/alphabet-learn'

export default function AlphabetLettersLearnPage() {
  const router = useRouter()

  return (
    <AlphabetLearnScreen
      onBackPress={() => router.push('/alphabet/letters')}
    />
  )
}


