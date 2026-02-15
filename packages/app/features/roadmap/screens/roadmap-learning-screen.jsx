import React from 'react'
import { RoadmapLearningLayout } from '../components/roadmap-learning/roadmap-learning-layout.web'

// Screen hiển thị lộ trình học theo ngày cho từng kỹ năng (nghe/đọc/viết)
// Level được truyền qua props (web route / native navigation), mặc định = 1.
export function RoadmapLearningScreen({ level = 1 }) {
  return <RoadmapLearningLayout level={level} />
}

