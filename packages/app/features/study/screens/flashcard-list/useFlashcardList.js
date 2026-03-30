import { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { getFlashcardTopics } from '@tokki/app/features/study/api'

// Import useFocusEffect chỉ trên mobile (React Navigation)
let useFocusEffect = null
if (Platform.OS !== 'web') {
  try {
    const navModule = require('@react-navigation/native')
    useFocusEffect = navModule.useFocusEffect
  } catch (e) {
    // React Navigation không có sẵn, bỏ qua
  }
}

// Wrapper hook để sử dụng useFocusEffect an toàn (chỉ chạy khi có React Navigation)
function useSafeFocusEffect(callback) {
  if (useFocusEffect) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFocusEffect(callback)
  }
}

/**
 * Hook xử lý logic cho FlashcardListScreen
 */
export function useFlashcardList(levelId) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [isLevelResolved] = useState(true)

  const [pageNumber, setPageNumber] = useState(1)
  const pageSize = 5

  const debounceTimerRef = useRef(null)



  const effectiveLevelId = levelId ?? null

  const fetchTopics = useCallback(async () => {
    if (!isLevelResolved) return
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(effectiveLevelId, {
        pageNumber,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
      })
      setTopics(Array.isArray(data) ? data : [])
      setIsInitialLoading(false)
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, effectiveLevelId, isLevelResolved, pageNumber])

  useEffect(() => {
    if (!isLevelResolved) return
    fetchTopics()
  }, [fetchTopics, isLevelResolved])

  const refreshOnFocus = useCallback(() => {
    if (isLevelResolved && !isInitialLoading) {
      fetchTopics()
    }
  }, [fetchTopics, isInitialLoading, isLevelResolved])

  useSafeFocusEffect(refreshOnFocus)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const handleSearchSubmit = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setPageNumber(1)
    setDebouncedSearchTerm(searchTerm)
  }

  const canNextPage = topics.length === pageSize

  const handlePrevPage = () => {
    setPageNumber((p) => Math.max(1, p - 1))
  }

  const handleNextPage = () => {
    if (!canNextPage) return
    setPageNumber((p) => p + 1)
  }

  return {
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
  }
}
