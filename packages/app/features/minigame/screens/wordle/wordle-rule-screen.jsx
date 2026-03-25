import React from 'react'
import { Platform } from 'react-native'

import { WordleRuleLayoutWeb } from '../../components/wordle/wordle-rule/wordle-rule-layout.web'
import { WordleRuleLayoutNative } from '../../components/wordle/wordle-rule/wordle-rule-layout.native'

export function WordleRuleScreen({ basePath = '/minigame/wordle' }) {
  if (Platform.OS === 'web') {
    return <WordleRuleLayoutWeb basePath={basePath} />
  }

  return <WordleRuleLayoutNative basePath={basePath} />
}

export default WordleRuleScreen
