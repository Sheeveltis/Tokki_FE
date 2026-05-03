import React from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapPracticeTestLayout } from '../components/roadmap-practice-test/roadmap-practice-test-layout.web'

export function RoadmapPracticeTestScreen({ questionTypeId }) {
  const searchParams = useSearchParams()
  const qTypeFromQuery = Platform.OS === 'web' ? searchParams?.get?.('questionTypeId') || questionTypeId : questionTypeId
  const taskId = Platform.OS === 'web' ? searchParams?.get?.('taskId') : null
  const quantity = Platform.OS === 'web' ? searchParams?.get?.('quantity') || '10' : '10'
  const mode = Platform.OS === 'web' ? searchParams?.get?.('mode') : null

  return <RoadmapPracticeTestLayout questionTypeId={qTypeFromQuery} taskId={taskId} quantity={parseInt(quantity)} mode={mode} />
}
