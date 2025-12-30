'use client'

import React from 'react'
import MatchingCardRuleScreen from '@tokki/app/features/minigame/matching-card/matching-card-rule/matching-card-rule-screen'

export default function MatchingCardRulePage({ searchParams }) {
  const levelId = searchParams?.level || ''
  return <MatchingCardRuleScreen levelId={levelId} />
}

