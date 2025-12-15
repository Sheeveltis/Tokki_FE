'use client'

import { useRouter } from 'next/navigation'
import AlphabetSelectModeScreen from 'app/features/study/alphabet-select-mode'

export default function AlphabetPage() {
  const router = useRouter()

  return (
    <AlphabetSelectModeScreen
      onBackPress={() => router.push('/menu-study?level=1')}
      onLettersPress={() => router.push('/alphabet/letters')}
      onSyllablesPress={() => router.push('/alphabet/syllables')}
    />
  )
}

