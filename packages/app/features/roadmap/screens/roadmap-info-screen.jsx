'use client'

import { useState } from 'react'
import { useRouter } from 'solito/navigation'
import { RoadmapInfoLayout } from '../components/roadmap-info/roadmap-info-layout.web'

// Định nghĩa mapping giữa level và key bài thi
const ENTRANCE_EXAM_KEYS = {
  1: 'ENTRANCE_EXAM_TOPIK_1',
  2: 'ENTRANCE_EXAM_TOPIK_2',
  3: 'ENTRANCE_EXAM_TOPIK_3',
  4: 'ENTRANCE_EXAM_TOPIK_4',
  5: 'ENTRANCE_EXAM_TOPIK_5',
  6: 'ENTRANCE_EXAM_TOPIK_6',
}

export function RoadmapInfoScreen() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  const handleStart = (level, selfDeclaredLevel) => {
    // Lấy exam key dựa trên level người dùng chọn
    const examKey = ENTRANCE_EXAM_KEYS[level]
    
    // Truyền cả level và examKey qua query params để trang test sử dụng
    const selfDeclaredLevelQuery = selfDeclaredLevel ? `&selfDeclaredLevel=${encodeURIComponent(selfDeclaredLevel)}` : ''
    router.push(`/roadmap/test?level=${level}&examKey=${examKey}&isEntrance=1${selfDeclaredLevelQuery}`)
  }

  if (isChecking) {
    return null
  }

  return <RoadmapInfoLayout onStart={handleStart} initialLevel={1} />
}