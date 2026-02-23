import React from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapTestLayout } from '../components/roadmap-test/roadmap-test-layout.web'

export function RoadmapTestScreen({ level = 1 }) {
  const searchParams = useSearchParams()
  const levelFromQuery =
    Platform.OS === 'web' ? Number(searchParams?.get?.('level') || level) : level

  return <RoadmapTestLayout level={levelFromQuery || 1} />
}
