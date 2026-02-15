import React from 'react'
import { useRouter } from 'solito/navigation'

import WordleRule from '../../components/wordle/wordle-rule/wordle-rule'

export function WordleRuleScreen({ basePath = '/minigame/wordle' }) {
  const router = useRouter()

  const handleStart = () => {
    router.push(`${basePath}/wordle-play`)
  }

  return <WordleRule onStart={handleStart} />
}

export default WordleRuleScreen



