import React from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useMenuStudy } from './useMenuStudy.native'
import { MenuStudyLayout as MobileLayout } from './components/layout/menu-study-layout.mobile'
import { MenuStudyMain as MobileMain } from './components/layout/menu-study-main.mobile'

/**
 * MenuStudyScreen: Screen wrapper cho MenuStudy trong React Navigation
 * Xử lý navigation native và route params
 */
export function MenuStudyScreen({ 
  route: routeProp, 
  navigation: navigationProp,
  ...otherProps 
}) {
  // Sử dụng hooks từ React Navigation nếu có, nếu không dùng props
  const navigation = navigationProp || useNavigation()
  const route = routeProp || useRoute()
  
  // Lấy levelId từ route params
  const levelId = route?.params?.levelId || null

  const {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
    handleTopikRoadmapPress,
  } = useMenuStudy(navigation, levelId)

  // Handler cho nút back
  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  // Handler cho quick test (nếu cần)
  const handleQuickTestPress = () => {
    // Có thể navigate đến trang test nếu cần
    // navigation.navigate('roadmap-test', { levelId })
  }

  return (
    <MobileLayout
      levelId={levelId}
      onBackPress={handleBackPress}
      onQuickTestPress={handleQuickTestPress}
    >
      <MobileMain
        levelId={levelId}
        onModulePress={handleModulePress}
        showLoginRequest={showLoginRequest}
        onCloseLoginRequest={() => setShowLoginRequest(false)}
        onAlphabetPress={handleAlphabetPress}
        onTopikRoadmapPress={handleTopikRoadmapPress}
      />
    </MobileLayout>
  )
}

export default MenuStudyScreen
