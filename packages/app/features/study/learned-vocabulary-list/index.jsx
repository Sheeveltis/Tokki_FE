import React, { useState } from 'react'
import { Platform } from 'react-native'
import { useLearnedVocabularyList } from './useLearnedVocabularyList'
import { 
  LearnedVocabularyListLayout as WebLayout,
  LearnedVocabularyListMain as WebMain,
  LearnedVocabularyListLayoutMobile as MobileLayout,
  LearnedVocabularyListMainMobile as MobileMain
} from './components'
import { LearnedVocabularyPracticeMode } from './components/practice/LearnedVocabularyPracticeMode'
import { LearnedVocabularyPracticeLayout as PracticeWebLayout } from './components/practice/LearnedVocabularyPracticeLayout.web'
import { LearnedVocabularyPracticeLayout as PracticeMobileLayout } from './components/practice/LearnedVocabularyPracticeLayout.mobile'

/**
 * LearnedVocabularyListScreen: Trang danh sách từ vựng đã học
 * Điều phối giữa web và mobile layout
 * Hỗ trợ 2 chế độ: List (xem danh sách) và Practice (học tập)
 */
export function LearnedVocabularyListScreen({ 
  onBackPress, 
  title = 'Từ vựng đã học',
  route, // React Navigation prop - có thể bỏ qua
  navigation, // React Navigation prop - có thể bỏ qua
  ...otherProps // Bỏ qua các props khác từ navigation
}) {
  const [mode, setMode] = useState('list') // 'list' | 'practice'
  
  const {
    vocabularies,
    loading,
    isInitialLoading,
    error,
    fetchVocabularies,
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
    pageNumber,
    pageSize,
    totalPages,
    canNextPage,
    canPrevPage,
    handlePrevPage,
    handleNextPage,
    reviewVocabularies,
    reviewCount,
  } = useLearnedVocabularyList()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  // Nếu đang ở chế độ practice, hiển thị component practice
  if (mode === 'practice') {
    const PracticeLayout = Platform.OS === 'web' ? PracticeWebLayout : PracticeMobileLayout
    return (
      <PracticeLayout>
        <LearnedVocabularyPracticeMode
          vocabularies={reviewVocabularies.length > 0 ? reviewVocabularies : vocabularies}
          onBack={() => setMode('list')}
          onPracticeComplete={() => {
            setMode('list')
            fetchVocabularies() // Refresh danh sách sau khi học
          }}
        />
      </PracticeLayout>
    )
  }

  // Chế độ list (mặc định)
  return (
    <Layout>
      <Main
        title={title}
        vocabularies={vocabularies}
        loading={loading}
        isInitialLoading={isInitialLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onBackPress={onBackPress}
        onRetry={fetchVocabularies}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        canNextPage={canNextPage}
        canPrevPage={canPrevPage}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        reviewCount={reviewCount}
        onStartPractice={() => setMode('practice')}
      />
    </Layout>
  )
}

export default LearnedVocabularyListScreen

