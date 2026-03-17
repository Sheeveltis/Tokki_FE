'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { RoadmapInfoLayout } from '../components/roadmap-info/roadmap-info-layout.web'
import { getUserLevel } from '../../authentication/api'

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
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkUserLevel = async () => {
      try {
        const storedLevel = typeof window !== 'undefined'
          ? window.localStorage.getItem('userLevel')
          : null

        if (storedLevel) {
          const level = parseInt(storedLevel, 10)
          if (level && level >= 1 && level <= 6) {
            router.replace(`/roadmap/learning?level=${level}`)
            return
          }
        }

        const levelResponse = await getUserLevel()
        if (levelResponse?.isSuccess && levelResponse?.data?.level) {
          const level = parseInt(levelResponse.data.level, 10)
          if (level && level >= 1 && level <= 6) {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('userLevel', String(level))
            }
            router.replace(`/roadmap/learning?level=${level}`)
            return
          }
        }
      } catch (error) {
        console.error('Error checking user level:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserLevel()
  }, [router])

  const handleStart = (level, selfDeclaredLevel) => {
    // Lấy exam key dựa trên level người dùng chọn
    const examKey = ENTRANCE_EXAM_KEYS[level]
    
    // Truyền cả level và examKey qua query params để trang test sử dụng
    const selfDeclaredLevelQuery = selfDeclaredLevel ? `&selfDeclaredLevel=${encodeURIComponent(selfDeclaredLevel)}` : ''
    router.push(`/roadmap/test?level=${level}&examKey=${examKey}${selfDeclaredLevelQuery}`)
  }

  if (isChecking) {
    return null
  }

  return <RoadmapInfoLayout onStart={handleStart} initialLevel={1} />
}