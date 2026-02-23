import React, { useEffect, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { RoadmapInfoLayout } from '../components/roadmap-info/roadmap-info-layout.web'
import { getUserLevel } from '../../authentication/api'

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

  const handleStart = (level) => {
    router.push(`/roadmap/test?level=${level}`)
  }

  if (isChecking) {
    return null
  }

  return <RoadmapInfoLayout onStart={handleStart} initialLevel={1} />
}
