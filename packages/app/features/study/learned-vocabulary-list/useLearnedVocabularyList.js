import { useState, useEffect, useCallback, useMemo } from 'react'
import { getLearnedVocabularies } from '../api'

/**
 * Hook xử lý logic cho LearnedVocabularyListScreen
 */
export function useLearnedVocabularyList() {
  const [allVocabularies, setAllVocabularies] = useState([]) // Tất cả từ vựng từ API
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 20

  // Fetch learned vocabularies từ API (chỉ fetch một lần, không pagination)
  const fetchVocabularies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Lấy tối đa 1000 từ vựng (có thể tăng nếu cần)
      const data = await getLearnedVocabularies({ limit: 1000 })
      setAllVocabularies(Array.isArray(data) ? data : [])
      setIsInitialLoading(false) // Đánh dấu đã load lần đầu xong
    } catch (err) {
      console.error('Error fetching learned vocabularies:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng đã học')
      setAllVocabularies([])
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load data khi component mount
  useEffect(() => {
    fetchVocabularies()
  }, [fetchVocabularies])

  // Lọc từ vựng cần review (dựa trên nextReviewAt)
  const { reviewVocabularies, reviewCount } = useMemo(() => {
    const now = new Date()
    const needReview = allVocabularies.filter((vocab) => {
      if (!vocab.nextReviewAt) return false
      const reviewDate = new Date(vocab.nextReviewAt)
      return reviewDate <= now
    })
    
    // Sắp xếp theo độ ưu tiên: nextReviewAt sớm nhất trước, sau đó là boxLevel thấp nhất
    needReview.sort((a, b) => {
      const dateA = new Date(a.nextReviewAt || 0)
      const dateB = new Date(b.nextReviewAt || 0)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      return (a.boxLevel || 1) - (b.boxLevel || 1)
    })

    return {
      reviewVocabularies: needReview,
      reviewCount: needReview.length,
    }
  }, [allVocabularies])

  // Filter và paginate vocabularies dựa trên searchTerm
  const { vocabularies, totalPages } = useMemo(() => {
    let filtered = allVocabularies

    // Filter theo searchTerm (tìm trong word và meaning)
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim()
      filtered = allVocabularies.filter(
        (vocab) =>
          vocab.word?.toLowerCase().includes(lowerSearchTerm) ||
          vocab.meaning?.toLowerCase().includes(lowerSearchTerm) ||
          vocab.pronunciation?.toLowerCase().includes(lowerSearchTerm)
      )
    }

    // Pagination
    const totalPages = Math.ceil(filtered.length / pageSize)
    const startIndex = (pageNumber - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginated = filtered.slice(startIndex, endIndex)

    return {
      vocabularies: paginated,
      totalPages,
    }
  }, [allVocabularies, searchTerm, pageNumber, pageSize])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setPageNumber(1) // Reset về trang đầu khi search
  }

  const handleSearchSubmit = () => {
    // Không cần làm gì thêm, search đã được xử lý trong useMemo
    setPageNumber(1)
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

  return {
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
  }
}

