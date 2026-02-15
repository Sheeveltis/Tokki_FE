import React from 'react'
import { RoadmapPracticeLayout } from '../components/roadmap-practice/roadmap-practice-layout.web'

// Trang danh sách đề luyện tập (nghe / đọc) cho từng item "Luyện tập"
export function RoadmapPracticeScreen({ practiceId }) {
  return <RoadmapPracticeLayout practiceId={practiceId} />
}

