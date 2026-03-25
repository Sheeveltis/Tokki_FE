import React from 'react'
import { useSearchParams } from 'solito/navigation'
import WordleBoard from '../../components/wordle/wordle-board/wordle-board'

export function WordleBoardScreen() {
  const searchParams = useSearchParams()
  const dailyWordleId = searchParams?.get?.('dailyWordleId') || ''

  return <WordleBoard dailyWordleId={dailyWordleId} />
}

export default WordleBoardScreen