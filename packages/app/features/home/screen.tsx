import { View } from 'react-native'
import { HomeLayout } from './components/home-layout.web'
import { HomeMain } from './components/home-main'
import { useSidebarData } from './api/useHomeQueries'
import { LoadingWithContainer } from '../../../components/Loading'

interface HomeScreenProps {
  onHomePress?: () => void;      
  onRoadmapPress?: () => void;
  onFlashcardPress?: () => void;
  onBlogPress?: () => void;
  onProfilePress?: () => void;
}

export function HomeScreen({
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
}: HomeScreenProps) {

  const { data: sidebarData, isLoading: sidebarLoading, error } = useSidebarData()

  if (sidebarLoading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#5E794C"
        shadowColor="#5E794C50"
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

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