import React from 'react'
import { Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useFlashcardList } from './useFlashcardList'
import { 
  FlashcardListLayout as WebLayout,
  FlashcardListMain as WebMain,
  FlashcardListLayoutMobile as MobileLayout,
  FlashcardListMainMobile as MobileMain
} from './components'

/**
 * FlashcardListScreen: Trang danh sách flashcard
 * Điều phối giữa web và mobile layout
 */
export function FlashcardListScreen({ 
  onTopicPress, 
  onBackPress, 
  title = 'Flashcard', 
  levelId,
  onFavoritesPress,
  onLearnedPress,
  route: routeProp, // React Navigation prop - có thể bỏ qua
  navigation: navigationProp, // React Navigation prop - có thể bỏ qua
  ...otherProps // Bỏ qua các props khác từ navigation
}) {
  // Sử dụng hooks từ React Navigation nếu có, nếu không dùng props
  const navigation = navigationProp || (Platform.OS !== 'web' ? useNavigation() : null)
  const route = routeProp || (Platform.OS !== 'web' ? useRoute() : null)

  // Lấy levelId từ route params nếu có
  const routeLevelId = route?.params?.levelId || levelId
  const {
    topics,
    loading,
    isInitialLoading,
    error,
    fetchTopics,
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
    pageNumber,
    pageSize,
    canNextPage,
    handlePrevPage,
    handleNextPage,
  } = useFlashcardList(routeLevelId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  // Handler cho nút back
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
      return
    }
    
    // Nếu không có onBackPress từ props, sử dụng navigation
    if (navigation && navigation.canGoBack()) {
      navigation.goBack()
    }
  }

  // Handler cho nút favorites
  const handleFavoritesPress = () => {
    // Nếu có onFavoritesPress từ props (web), sử dụng nó
    if (onFavoritesPress) {
      onFavoritesPress()
      return
    }

    // Nếu không có onFavoritesPress (mobile), xử lý navigation trực tiếp
    // Điều hướng đến trang study với chế độ favorites
    if (Platform.OS !== 'web' && navigation) {
      navigation.navigate('flashcard-study', { 
        isFavoritesMode: true 
      })
    }
  }

  // Handler cho nút learned vocabulary
  const handleLearnedPress = () => {
    // Nếu có onLearnedPress từ props (web), sử dụng nó
    if (onLearnedPress) {
      onLearnedPress()
      return
    }

    // Nếu không có onLearnedPress (mobile), xử lý navigation trực tiếp
    // Điều hướng đến trang từ vựng đã học
    if (Platform.OS !== 'web' && navigation) {
      navigation.navigate('learned-vocabulary-list')
    }
  }

  // Wrapper function để kiểm tra progress và điều hướng phù hợp
  // Logic: nếu progress === 100% thì điều hướng đến trang study (FlashcardStudyScreen), ngược lại điều hướng đến học lần đầu
  const handleTopicPress = (topic) => {
    const topicId = topic?.id || topic?.topicId
    if (!topicId) return

    const progress = topic?.progress ?? 0
    const isProgressComplete = progress >= 100

    // Nếu có onTopicPress từ props (web), sử dụng nó
    if (onTopicPress) {
      // Nếu progress === 100%, điều hướng đến trang study (FlashcardStudyScreen)
      if (isProgressComplete) {
        onTopicPress({ ...topic, progress: 100, isProgressComplete: true })
        return
      }
      // Ngược lại, điều hướng đến học lần đầu (FlashcardFirstLearnScreen)
      onTopicPress(topic)
      return
    }

    // Nếu không có onTopicPress (mobile), xử lý navigation trực tiếp
    // Logic: nếu progress === 100% thì điều hướng đến trang study, ngược lại điều hướng đến học lần đầu
    if (Platform.OS !== 'web' && navigation) {
      if (isProgressComplete) {
        // Điều hướng đến trang study (FlashcardStudyScreen)
        navigation.navigate('flashcard-study', { topicId: String(topicId) })
      } else {
        // Điều hướng đến trang học lần đầu (FlashcardFirstLearnScreen)
        navigation.navigate('flashcard-first-learn', { topicId: String(topicId) })
      }
    }
  }

  return (
    <Layout
      levelId={routeLevelId}
      onBackPress={handleBackPress}
      onQuickTestPress={otherProps.onQuickTestPress}
      lessonsLearned={otherProps.lessonsLearned}
      streakDays={otherProps.streakDays}
      onFavoritesPress={handleFavoritesPress}
      onLearnedPress={handleLearnedPress}
    >
      <Main
        title={title}
        topics={topics}
        loading={loading}
        isInitialLoading={isInitialLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onBackPress={handleBackPress}
        onTopicPress={handleTopicPress}
        onRetry={fetchTopics}
        onFavoritesPress={handleFavoritesPress}
        onLearnedPress={handleLearnedPress}
        pageNumber={pageNumber}
        pageSize={pageSize}
        canNextPage={canNextPage}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </Layout>
  )
}

export default FlashcardListScreen
