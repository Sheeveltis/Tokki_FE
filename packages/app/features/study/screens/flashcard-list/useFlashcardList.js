import { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { getFlashcardTopics } from '@tokki/app/features/study/api'
import { getCurrentUserId } from '@tokki/app/provider/api/client'
import { getProgress } from '@tokki/app/features/user/api/profile'

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
export function useFlashcardList(initialLevelId) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  // Nếu có initialLevelId (từ URL/params), ưu tiên nó. Nếu không, để null và load aimLevel.
  const [selectedLevel, setSelectedLevel] = useState(initialLevelId ?? null)
  const [isLevelAutoLoaded, setIsLevelAutoLoaded] = useState(false)

  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10 // Đã chỉnh sửa thành 10 theo yêu cầu người dùng

  const debounceTimerRef = useRef(null)

  // 1. Effect để tự động lấy aimLevel nếu chưa có levelId ban đầu
  useEffect(() => {
    const loadAimLevel = async () => {
      // Nếu đã có levelId từ props/URL, không tự động ghi đè
      if (initialLevelId) {
        setIsLevelAutoLoaded(true)
        return
      }

      try {
        const userId = getCurrentUserId()
        if (userId) {
          // Bỏ logic tự động lấy level người dùng để tránh ép buộc level
          // const progress = await getProgress(userId)
          // if (progress?.level) {
          //   setSelectedLevel(progress.level)
          // }
        }
      } catch (err) {
        console.error('[useFlashcardList] Error loading user aimLevel:', err)
      } finally {
        setIsLevelAutoLoaded(true)
      }
    }

    loadAimLevel()
  }, [initialLevelId])

  const fetchTopics = useCallback(async () => {
    // Chỉ fetch khi đã xác định xong level (dù là aimLevel hay mặc định)
    if (!isLevelAutoLoaded) return

    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(selectedLevel, {
        pageNumber,
        pageSize,
        searchTerm: debouncedSearchTerm || undefined,
      })
      
      setTopics(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
      setIsInitialLoading(false)
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
      setTotalPages(1)
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, selectedLevel, pageNumber, pageSize, isLevelAutoLoaded])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const refreshOnFocus = useCallback(() => {
    if (!isInitialLoading) {
      fetchTopics()
    }
  }, [fetchTopics, isInitialLoading])

  useSafeFocusEffect(refreshOnFocus)

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchTerm !== debouncedSearchTerm) {
        setPageNumber(1)
        setDebouncedSearchTerm(searchTerm)
      }
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchTerm, debouncedSearchTerm])

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

  const handleLevelChange = (level) => {
    setSelectedLevel(level)
    setPageNumber(1)
  }

  const canNextPage = pageNumber < totalPages

  const handlePrevPage = () => {
    setPageNumber((p) => Math.max(1, p - 1))
  }

  const handleNextPage = () => {
    if (!canNextPage) return
    setPageNumber((p) => p + 1)
  }

  const handlePageChange = (page) => {
    setPageNumber(page)
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
    selectedLevel,
    handleLevelChange,
    pageNumber,
    totalPages,
    totalCount,
    pageSize,
    canNextPage,
    handlePrevPage,
    handleNextPage,
    handlePageChange,
  }
}
