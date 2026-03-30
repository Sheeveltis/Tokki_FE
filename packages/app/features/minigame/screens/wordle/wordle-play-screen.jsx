import { useSearchParams } from 'solito/navigation'

import WordlePlay from '../../components/wordle/wordle-play/wordle-play'

export function WordlePlayScreen({ route }) {
  const searchParams = useSearchParams()
  const routeParams = route?.params || {}

  const levelRaw = routeParams.level ?? searchParams?.get('level')
  const dailyWordleId = routeParams.dailyWordleId ?? searchParams?.get('dailyWordleId') ?? ''
  const wordLengthRaw = routeParams.wordLength ?? searchParams?.get('wordLength')
  const attemptCountRaw = routeParams.attemptCount ?? searchParams?.get('attemptCount')
  const maxAttemptsRaw = routeParams.maxAttempts ?? searchParams?.get('maxAttempts')

  const level = levelRaw ? Number(levelRaw) : 1
  const wordLength = wordLengthRaw ? Number(wordLengthRaw) : undefined
  const attemptCount = attemptCountRaw ? Number(attemptCountRaw) : 0
  const maxAttempts = maxAttemptsRaw ? Number(maxAttemptsRaw) : undefined

  return (
    <WordlePlay
      level={level}
      dailyWordleId={dailyWordleId}
      initialWordLength={wordLength}
      initialAttemptCount={attemptCount}
      maxAttempts={maxAttempts}
    />
  )
}

export default WordlePlayScreen



