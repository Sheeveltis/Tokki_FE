import { useState, useEffect, useCallback } from 'react'
import { getFlashcardTopics } from '../api'

/**
 * Hook xử lý logic cho FlashcardListScreen
 */
export function useFlashcardList(levelId) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState(levelId ?? null)

  // Fetch flashcard topics từ API
  const fetchTopics = useCallback(async (term = searchTerm, level = selectedLevel) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(level ?? levelId, {
        searchTerm: term || undefined,
      })
      setTopics(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [levelId, searchTerm, selectedLevel])

  // Load data khi component mount hoặc levelId thay đổi
  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Đồng bộ selectedLevel khi prop levelId thay đổi
  useEffect(() => {
    if (levelId !== undefined && levelId !== null) {
      setSelectedLevel(levelId)
    }
  }, [levelId])

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const handleSearchSubmit = () => {
    fetchTopics(searchTerm)
  }

  const handleLevelChange = (level) => {
    setSelectedLevel(level)
    fetchTopics(searchTerm, level)
  }

  return {
    topics,
    loading,
    error,
    fetchTopics,
    searchTerm,
    handleSearchChange,
    handleSearchSubmit,
    selectedLevel,
    handleLevelChange,
  }
}

