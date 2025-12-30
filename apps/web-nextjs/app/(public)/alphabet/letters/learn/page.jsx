'use client'

import { useRouter } from 'next/navigation'
import AlphabetLearnScreen from '@tokki/app/features/study/alphabet-learn'

export default function AlphabetLettersLearnPage() {
  const router = useRouter()

  return (
    <AlphabetLearnScreen
      onBackPress={() => router.push('/alphabet/letters')}
    />
  )
}


