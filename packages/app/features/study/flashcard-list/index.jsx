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
        onTopicPress={onTopicPress}
        onRetry={fetchTopics}
        onFavoritesPress={onFavoritesPress}
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
