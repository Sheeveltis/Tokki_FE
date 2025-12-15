import { useState, useEffect, useCallback } from 'react'
import { getFlashcardTopics } from '../api'

/**
 * Hook xử lý logic cho FlashcardListScreen
 */
export function useFlashcardList(levelId) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch flashcard topics từ API
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(levelId)
      setTopics(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [levelId])

  // Load data khi component mount hoặc levelId thay đổi
  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  return {
    topics,
    loading,
    error,
    fetchTopics,
  }
}

