import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic } from '../api'

/**
 * Hook xử lý logic cho FlashcardStudyScreen
 */
export function useFlashcardStudy(topicId) {
  const [flashcards, setFlashcards] = useState([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      const flashcardsArray = Array.isArray(data) ? data : []
      setFlashcards(flashcardsArray)
      setIndex(0)
      setIsFlipped(false)
      setFavorites(new Set())
      setLearned(new Set())
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    if (!topicId) {
      setFlashcards([])
      setLoading(false)
      setError('Thiếu thông tin chủ đề')
      return
    }
    fetchFlashcards()
  }, [fetchFlashcards, topicId])

  // Filter flashcards: chỉ lấy những card chưa học
  const unlearnedFlashcards = flashcards.filter((_, idx) => !learned.has(idx))
  const unlearnedIndices = flashcards
    .map((_, idx) => idx)
    .filter((idx) => !learned.has(idx))

  // Map index trong unlearned list về index gốc trong FLASHCARDS
  const originalIndex =
    unlearnedIndices.length > 0
      ? unlearnedIndices[index % unlearnedIndices.length]
      : undefined
  const current =
    originalIndex !== undefined ? flashcards[originalIndex] || {} : {}
  const isFavorite = originalIndex !== undefined ? favorites.has(originalIndex) : false
  const isLearned = originalIndex !== undefined ? learned.has(originalIndex) : false

  // Reset index nếu vượt quá số lượng card chưa học
  useEffect(() => {
    if (unlearnedIndices.length > 0 && index >= unlearnedIndices.length) {
      setIndex(0)
    }
  }, [unlearnedIndices.length, index])

  const handleNext = () => {
    setIsFlipped(false)
    if (unlearnedIndices.length > 0) {
      setIndex((prev) => (prev + 1) % unlearnedIndices.length)
    }
  }

  const handlePrev = () => {
    setIsFlipped(false)
    if (unlearnedIndices.length > 0) {
      setIndex((prev) => (prev - 1 + unlearnedIndices.length) % unlearnedIndices.length)
    }
  }

  const handleSelectFlashcard = (newIndex) => {
    setIsFlipped(false)
    // Tìm index trong unlearnedIndices tương ứng với newIndex (index gốc)
    const unlearnedIndex = unlearnedIndices.findIndex((idx) => idx === newIndex)
    if (unlearnedIndex !== -1) {
      setIndex(unlearnedIndex)
    }
  }

  const toggleFavorite = () => {
    if (originalIndex === undefined) return
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(originalIndex)) {
        next.delete(originalIndex)
      } else {
        next.add(originalIndex)
      }
      return next
    })
  }

  const markAsLearned = () => {
    if (originalIndex !== undefined) {
      setLearned((prev) => {
        const next = new Set(prev)
        next.add(originalIndex)
        return next
      })
      // Tự động chuyển sang card tiếp theo
      handleNext()
    }
  }

  const markAsNeedReview = () => {
    if (originalIndex !== undefined) {
      setLearned((prev) => {
        const next = new Set(prev)
        next.delete(originalIndex)
        return next
      })
    }
  }

  const resetAllLearned = () => {
    setLearned(new Set())
    setIndex(0)
    setIsFlipped(false)
  }

  return {
    flashcards,
    index,
    isFlipped,
    favorites,
    learned,
    unlearnedFlashcards,
    unlearnedIndices,
    current,
    currentIndex: originalIndex !== undefined ? originalIndex : -1,
    isFavorite,
    isLearned,
    handleNext,
    handlePrev,
    handleSelectFlashcard,
    toggleFavorite,
    markAsLearned,
    markAsNeedReview,
    resetAllLearned,
    setIsFlipped,
    loading,
    error,
    fetchFlashcards,
  }
}

