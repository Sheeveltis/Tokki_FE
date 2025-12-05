import { useEffect, useState } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'

// Import layout - React Native bundler sẽ tự động chọn .web.jsx hoặc .native.jsx
// TypeScript cần import cụ thể, nhưng runtime sẽ resolve đúng platform
import { HomeLayout } from './components/home-layout.web'
import { HomeMain } from './components/home-main'
import { getSidebarData } from './api'

/**
 * HomeScreen: Trang chủ chính
 * 
 * Sử dụng HomeLayout để render giao diện phù hợp với môi trường (Web/Native)
 * HomeLayout sẽ tự động chọn .web.jsx hoặc .native.jsx
 * 
 * @param {{
 *   onHomePress?: () => void
 *   onRoadmapPress?: () => void
 *   onFlashcardPress?: () => void
 *   onBlogPress?: () => void
 *   onProfilePress?: () => void
 * }} props
 */
export function HomeScreen({
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
}) {
  const [sidebarData, setSidebarData] = useState(null)
  const [sidebarLoading, setSidebarLoading] = useState(true)

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const data = await getSidebarData()
        setSidebarData(data)
      } catch (err) {
        console.error('Không thể tải sidebar data:', err)
      } finally {
        setSidebarLoading(false)
      }
    }

    fetchSidebarData()
  }, [])

  return (
    <HomeLayout
      sidebarData={sidebarData}
      onHomePress={onHomePress}
      onRoadmapPress={onRoadmapPress}
      onFlashcardPress={onFlashcardPress}
      onBlogPress={onBlogPress}
      onProfilePress={onProfilePress}
    >
      <HomeMain />
    </HomeLayout>
  )
}
