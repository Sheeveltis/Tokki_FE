import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
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
  route: routeProp, // React Navigation prop - có thể bỏ qua
  navigation: navigationProp, // React Navigation prop - có thể bỏ qua
  ...otherProps // Bỏ qua các props khác từ navigation
}) {
  // Sử dụng hooks từ React Navigation nếu có, nếu không dùng props
  const navigation = navigationProp || (Platform.OS !== 'web' ? useNavigation() : null)
  const route = routeProp || (Platform.OS !== 'web' ? useRoute() : null)

  const [mode, setMode] = useState('list') // 'list' | 'practice'
  const [practiceCount, setPracticeCount] = useState(20) // Số lượng từ muốn học
  
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
    allVocabularies, // Cần thêm để lấy tất cả từ vựng
  } = useLearnedVocabularyList()

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

  // Tính maxPracticeCount dựa trên số lượng từ vựng có sẵn
  const maxPracticeCount = reviewVocabularies.length > 0 ? reviewVocabularies.length : allVocabularies.length

  // Điều chỉnh practiceCount nếu vượt quá maxPracticeCount
  useEffect(() => {
    if (maxPracticeCount > 0 && practiceCount > maxPracticeCount) {
      setPracticeCount(maxPracticeCount)
    }
  }, [maxPracticeCount])

  // Lấy số lượng từ vựng để practice dựa trên lựa chọn của người dùng
  const getPracticeVocabularies = () => {
    const sourceVocabularies = reviewVocabularies.length > 0 ? reviewVocabularies : allVocabularies
    // Lấy số lượng từ đã chọn (tối đa là số lượng có sẵn)
    return sourceVocabularies.slice(0, Math.min(practiceCount, sourceVocabularies.length))
  }

  // Nếu đang ở chế độ practice, hiển thị component practice
  if (mode === 'practice') {
    const PracticeLayout = Platform.OS === 'web' ? PracticeWebLayout : PracticeMobileLayout
    return (
      <PracticeLayout>
        <LearnedVocabularyPracticeMode
          vocabularies={getPracticeVocabularies()}
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
    <Layout
      levelId={1} // Fallback levelId
      onBackPress={handleBackPress}
      lessonsLearned={30}
      streakDays={30}
    >
      <Main
        title={title}
        vocabularies={vocabularies}
        loading={loading}
        isInitialLoading={isInitialLoading}
        error={error}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onBackPress={handleBackPress}
        onRetry={fetchVocabularies}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        canNextPage={canNextPage}
        canPrevPage={canPrevPage}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        reviewCount={reviewCount}
        practiceCount={practiceCount}
        onPracticeCountChange={setPracticeCount}
        maxPracticeCount={maxPracticeCount}
        onStartPractice={() => setMode('practice')}
      />
    </Layout>
  )
}

export default LearnedVocabularyListScreen

