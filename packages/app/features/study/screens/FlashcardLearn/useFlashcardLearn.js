import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic } from '../../api'

/**
 * Hook xử lý logic cho FlashcardLearnScreen
 */
export function useFlashcardLearn(topicId) {
  const [flashcards, setFlashcards] = useState([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch flashcards từ API
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      setFlashcards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  const current = flashcards[index % flashcards.length] || {}
  const isFavorite = favorites.has(index)
  const isLearned = learned.has(index)
  const progress = flashcards.length > 0 ? Math.round((learned.size / flashcards.length) * 100) : 0

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const markAsLearned = () => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return {
    flashcards,
    index,
    isFlipped,
    favorites,
    learned,
    loading,
    error,
    current,
    isFavorite,
    isLearned,
    progress,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    setIsFlipped,
    fetchFlashcards,
  }
}

