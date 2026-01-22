import React from 'react'
import { Platform } from 'react-native'
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
  route, // React Navigation prop - có thể bỏ qua
  navigation, // React Navigation prop - có thể bỏ qua
  ...otherProps // Bỏ qua các props khác từ navigation
}) {
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
    selectedLevel,
    handleLevelChange,
    pageNumber,
    pageSize,
    canNextPage,
    handlePrevPage,
    handleNextPage,
  } = useFlashcardList(routeLevelId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  // Wrapper function để kiểm tra progress và điều hướng phù hợp
  const handleTopicPress = (topic) => {
    // Nếu progress là 100% (kiểm tra cả số nguyên và số thập phân), điều hướng đến trang study (ôn tập)
    const progress = topic?.progress ?? 0
    if (progress >= 100) {
      // Đánh dấu topic là đã học để onTopicPress điều hướng đến /flashcard/study
      onTopicPress?.({ ...topic, isLearned: true })
      return
    }
    // Ngược lại, điều hướng như bình thường (học lần đầu)
    onTopicPress?.(topic)
  }

  return (
    <Layout>
      <Main
        title={title}
        topics={topics}
        loading={loading}
        isInitialLoading={isInitialLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        onBackPress={onBackPress}
        onTopicPress={handleTopicPress}
        onRetry={fetchTopics}
        onFavoritesPress={onFavoritesPress}
        onLearnedPress={onLearnedPress}
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
