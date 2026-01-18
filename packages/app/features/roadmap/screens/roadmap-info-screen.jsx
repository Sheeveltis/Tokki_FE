import React from 'react'
import { useRouter } from 'solito/navigation'
import { RoadmapInfoLayout } from '../components/roadmap-info/roadmap-info-layout.web'

export function RoadmapInfoScreen() {
  const router = useRouter()

  const handleStart = (level) => {
    // Navigate to test page with selected level
    router.push(`/roadmap/test?level=${level}`)
  }

  return <RoadmapInfoLayout onStart={handleStart} initialLevel={1} />
}
