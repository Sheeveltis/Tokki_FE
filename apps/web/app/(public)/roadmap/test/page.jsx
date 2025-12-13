'use client'

import { useSearchParams } from 'next/navigation'
import { RoadmapTestLayout } from 'app/features/roadmap/roadmap-test/components/roadmap-test-layout.web'

export default function RoadmapTestPage() {
  const searchParams = useSearchParams()
  const level = parseInt(searchParams.get('level') || '1', 10)

  return <RoadmapTestLayout level={level} />
}

