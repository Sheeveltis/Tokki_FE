import React from 'react'
import { useSearchParams } from 'solito/navigation'
import WordlePlayWeb from '../../components/wordle/wordle-play/wordle-play.web'

export function WordlePlayScreen() {
  const searchParams = useSearchParams()
  const levelParam = searchParams?.get('level')
  const level = levelParam ? Number(levelParam) : 1
  const dailyWordleId = searchParams?.get('dailyWordleId') || ''
  const wordLengthParam = searchParams?.get('wordLength')
  const wordLength = wordLengthParam ? Number(wordLengthParam) : undefined

  return <WordlePlayWeb level={level} dailyWordleId={dailyWordleId} initialWordLength={wordLength} />
}

export default WordlePlayScreen



