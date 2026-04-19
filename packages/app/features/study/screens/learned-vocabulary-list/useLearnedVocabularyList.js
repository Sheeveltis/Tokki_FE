import { useState, useEffect, useCallback, useMemo } from 'react'
import { getLearnedVocabulariesPaginated, getLearnedVocabularies } from '@tokki/app/features/study/api'

/**
 * Hook xử lý logic cho LearnedVocabularyListScreen
 */
export function useLearnedVocabularyList() {
  const [vocabularies, setVocabularies] = useState([]) // Từ vựng hiển thị ở trang hiện tại
  const [allVocabularies, setAllVocabularies] = useState([]) // Tất cả từ vựng (dùng để tính reviewCount nếu cần hoặc fallback)
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 30

  // Fetch paginated learned vocabularies từ API
  const fetchVocabularies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getLearnedVocabulariesPaginated({ 
        pageIndex: pageNumber, 
        pageSize 
      })
      
      setVocabularies(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
      
      if (isInitialLoading) {
        setIsInitialLoading(false)
      }
    } catch (err) {
      console.error('Error fetching learned vocabularies:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng đã học')
      setVocabularies([])
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, isInitialLoading])

  // Load data khi pageNumber thay đổi
  useEffect(() => {
    fetchVocabularies()
  }, [fetchVocabularies])

  // Filter local cho searchTerm (vẫn giữ local filter cho mượt, nhưng lý tưởng nên có server search)
  const filteredVocabularies = useMemo(() => {
    if (!searchTerm.trim()) return vocabularies

    const lowerSearchTerm = searchTerm.toLowerCase().trim()
    return vocabularies.filter(
      (vocab) =>
        vocab.word?.toLowerCase().includes(lowerSearchTerm) ||
        vocab.meaning?.toLowerCase().includes(lowerSearchTerm) ||
        vocab.pronunciation?.toLowerCase().includes(lowerSearchTerm)
    )
  }, [vocabularies, searchTerm])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    // Nếu muốn server search thì reset pageNumber ở đây
  }

  const handleSearchSubmit = () => {
    // Implement server search nếu backend hỗ trợ
  }

  const canNextPage = pageNumber < totalPages
  const canPrevPage = pageNumber > 1

  const handlePrevPage = () => {
    if (canPrevPage) {
      setPageNumber((p) => p - 1)
    }
  }

  const handleNextPage = () => {
    if (canNextPage) {
      setPageNumber((p) => p + 1)
    }
  }

  const [practiceVocabularies, setPracticeVocabularies] = useState([])
  const [practiceLoading, setPracticeLoading] = useState(false)

  // Fetch vocabularies cho practice mode
  const fetchPracticeVocabularies = useCallback(async (limit) => {
    try {
      setPracticeLoading(true)
      const data = await getLearnedVocabularies({ limit })
      setPracticeVocabularies(data)
      return data
    } catch (err) {
      console.error('Error fetching practice vocabularies:', err)
      return []
    } finally {
      setPracticeLoading(false)
    }
  }, [])

  return {
    vocabularies: filteredVocabularies,
    allVocabularies, // Giữ lại cho tương thích ngược nếu cần
    loading,
    isInitialLoading,
    error,
    fetchVocabularies,
    practiceVocabularies,
    practiceLoading,
    fetchPracticeVocabularies,
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
    pageNumber,
    pageSize,
    totalPages,
    totalCount,
    canNextPage,
    canPrevPage,
    handlePrevPage,
    handleNextPage,
    reviewVocabularies: [], // Sẽ fetch riêng khi start practice
    reviewCount: totalCount, // Giả định reviewCount là tổng số từ đã học (hoặc backend nên trả về riêng)
  }
}

