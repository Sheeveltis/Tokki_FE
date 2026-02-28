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
  const attemptCountParam = searchParams?.get('attemptCount')
  const maxAttemptsParam = searchParams?.get('maxAttempts')
  const attemptCount = attemptCountParam ? Number(attemptCountParam) : 0
  const maxAttempts = maxAttemptsParam ? Number(maxAttemptsParam) : undefined

  return (
    <WordlePlayWeb
      level={level}
      dailyWordleId={dailyWordleId}
      initialWordLength={wordLength}
      initialAttemptCount={attemptCount}
      maxAttempts={maxAttempts}
    />
  )
}

export default WordlePlayScreen



