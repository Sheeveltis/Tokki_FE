import React from 'react'
import { View, Platform } from 'react-native'
import { HomeLayout } from '../components/homepage/home-layout.web'
import { HomeMain } from '../components/homepage/home-main'
import { useSidebarData } from '../api/get-homepage'
import { LoadingWithContainer } from '../../../../components/Loading'
import { LandingPage } from '../components/homepage/LandingPage.web'
import { LandingLayout } from '../components/homepage/landing-layout.web'
import { getAuthToken } from 'app/provider/api/client'
import { useRouter } from 'solito/navigation'

export function HomeScreen({
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
}) {

  const { data: sidebarData, isLoading: sidebarLoading, error } = useSidebarData()
  const router = useRouter()

  const handleRoadmapPress = () => {
    // Chỉ áp dụng logic redirect này trên Web
    if (Platform.OS === 'web') {
      const token = getAuthToken()
      if (!token) {
        // Nếu chưa đăng nhập, chuyển sang trang login kèm redirect đến xem info lộ trình
        router.push('/login?redirect=/roadmap/info')
        return
      }
    }
    
    // Nếu đã đăng nhập hoặc trên mobile, dùng handler mặc định
    if (onRoadmapPress) onRoadmapPress()
  }

  if (sidebarLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <LoadingWithContainer
          size={48}
          color="#5E794C"
          shadowColor="#5E794C50"
        />
      </View>
    )
  }

  // Render LandingPage with LandingLayout on Web for premium experience
  if (Platform.OS === 'web') {
    return (
      <LandingLayout>
        <LandingPage 
          onRoadmapPress={handleRoadmapPress}
          onFlashcardPress={onFlashcardPress}
          onBlogPress={onBlogPress}
          onProfilePress={onProfilePress}
        />
      </LandingLayout>
    )
  }

  // Default layout for native or fallback
  return (
    <HomeLayout
      sidebarData={sidebarData}
    >
      <HomeMain />
    </HomeLayout>
  )
}