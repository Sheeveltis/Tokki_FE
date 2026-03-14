import React from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapTestLayout } from '../components/roadmap-test/roadmap-test-layout.web'

export function RoadmapTestScreen({ level = 1 }) {
  const searchParams = useSearchParams()
  const levelFromQuery =
    Platform.OS === 'web' ? Number(searchParams?.get?.('level') || level) : level
  const examKeyFromQuery =
    Platform.OS === 'web' ? searchParams?.get?.('examKey') || null : null

  return <RoadmapTestLayout level={levelFromQuery || 1} examKey={examKeyFromQuery} />
}
