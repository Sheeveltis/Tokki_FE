import React from 'react'
import { TopikTrialExamsWeb } from './topik-trial-exams.web'

export function TopikTrialExamsScreen({ onBackPress }) {
  return (
    <TopikTrialExamsWeb 
      onBackPress={onBackPress}
    />
  )
}

export default TopikTrialExamsScreen
