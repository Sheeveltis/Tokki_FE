import { useState, useEffect, useCallback, useRef } from 'react'
import { getFlashcardTopics } from '../api'

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
  const [selectedLevel, setSelectedLevel] = useState(levelId ?? null)
  const debounceTimerRef = useRef(null)

  // Fetch flashcard topics từ API
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(selectedLevel ?? levelId, {
        searchTerm: debouncedSearchTerm || undefined,
      })
      setTopics(Array.isArray(data) ? data : [])
      setIsInitialLoading(false) // Đánh dấu đã load lần đầu xong
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
      setIsInitialLoading(false)
    } finally {
      setLoading(false)
    }
  }, [levelId, debouncedSearchTerm, selectedLevel])

  // Load data khi component mount, debouncedSearchTerm hoặc selectedLevel thay đổi
  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Đồng bộ selectedLevel khi prop levelId thay đổi
  useEffect(() => {
    if (levelId !== undefined && levelId !== null) {
      setSelectedLevel(levelId)
    }
  }, [levelId])

  // Debounce searchTerm - chỉ cập nhật debouncedSearchTerm sau 500ms khi người dùng ngừng gõ
  useEffect(() => {
    // Clear timer cũ nếu có
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Tạo timer mới
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    // Cleanup khi component unmount hoặc searchTerm thay đổi
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
    // Hủy debounce timer và tìm kiếm ngay
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setDebouncedSearchTerm(searchTerm)
  }

  const handleLevelChange = (level) => {
    setSelectedLevel(level)
    // Hủy debounce timer và cập nhật debouncedSearchTerm ngay khi đổi level
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setDebouncedSearchTerm(searchTerm)
    // fetchTopics sẽ tự động chạy qua useEffect khi debouncedSearchTerm hoặc selectedLevel thay đổi
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
  }
}

