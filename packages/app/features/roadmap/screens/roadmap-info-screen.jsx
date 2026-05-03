import { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { RoadmapInfoLayout } from '../components/roadmap-info/roadmap-info-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

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
  const searchParams = useSearchParams()
  const needsTest = searchParams?.get('needsTest')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkCurrentRoadmap = async () => {
      setIsChecking(true)
      try {
        const response = await apiClient.get(ENDPOINTS.ROADMAP.CURRENT)
        const currentRoadmap = response?.data?.data
        if (currentRoadmap?.userRoadmapId) {
          router.replace('/roadmap/learning')
          return
        }
      } catch (err) {
        console.error('Failed to check current roadmap:', err)
      } finally {
        setIsChecking(false)
      }
    }

    checkCurrentRoadmap()
  }, [])

  useEffect(() => {
    if (Platform.OS === 'web' && needsTest === '1') {
      // Hiển thị thông báo yêu cầu test trên web
      import('antd').then(({ notification }) => {
        notification.info({
          message: 'Thông báo',
          description: 'Bạn cần phải test để tụi mình tạo lộ trình phù hợp cho bạn',
          placement: 'top',
          duration: 5,
        })
      })
    }
  }, [needsTest])

  const handleStart = (level) => {
    // Lấy exam key dựa trên level người dùng chọn
    const examKey = ENTRANCE_EXAM_KEYS[level]
    
    // Truyền cả level và examKey qua query params để trang test sử dụng
    router.push(`/roadmap/test?level=${level}&examKey=${examKey}&isEntrance=1`)
  }

  if (isChecking) {
    return null
  }

  return <RoadmapInfoLayout onStart={handleStart} initialLevel={1} />
}