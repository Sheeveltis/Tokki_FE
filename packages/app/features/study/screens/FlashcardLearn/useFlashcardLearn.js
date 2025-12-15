import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic } from '../../api'

/**
 * Hook xử lý logic cho FlashcardLearnScreen
 */
export function useFlashcardLearn(topicId) {
  const [flashcards, setFlashcards] = useState([])
  const [originalFlashcards, setOriginalFlashcards] = useState([]) // Lưu thứ tự ban đầu
  const [isShuffled, setIsShuffled] = useState(false) // Track trạng thái random
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [showInstructions, setShowInstructions] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch flashcards từ API
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      const flashcardsArray = Array.isArray(data) ? data : []
      setFlashcards(flashcardsArray)
      setOriginalFlashcards(flashcardsArray) // Lưu thứ tự ban đầu
      setIsShuffled(false) // Reset trạng thái random
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
      setOriginalFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  // Filter flashcards: chỉ lấy những card chưa học
  const unlearnedFlashcards = flashcards.filter((_, idx) => !learned.has(idx))
  const unlearnedIndices = flashcards
    .map((_, idx) => idx)
    .filter((idx) => !learned.has(idx))

  // Map index trong unlearned list về index gốc trong flashcards
  const originalIndex = unlearnedIndices[index % unlearnedIndices.length]
  const current = flashcards[originalIndex] || {}
  const isFavorite = originalIndex !== undefined ? favorites.has(originalIndex) : false
  const isLearned = originalIndex !== undefined ? learned.has(originalIndex) : false
  const progress = flashcards.length > 0 ? Math.round((learned.size / flashcards.length) * 100) : 0

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
    if (originalIndex !== undefined) {
      setLearned((prev) => {
        const next = new Set(prev)
        next.add(originalIndex)
        return next
      })
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

  // Hàm toggle giữa random và restore
  const toggleShuffle = useCallback(() => {
    if (isShuffled) {
      // Nhấn lần 2: Trả về thứ tự ban đầu
      setFlashcards([...originalFlashcards])
      setIsShuffled(false)
    } else {
      // Nhấn lần 1: Random thẻ
      setFlashcards((prev) => {
        const shuffled = [...prev]
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      })
      setIsShuffled(true)
    }
    // Reset index về 0 sau khi thay đổi
    setIndex(0)
    setIsFlipped(false)
  }, [isShuffled, originalFlashcards])

  return {
    flashcards,
    unlearnedFlashcards,
    index,
    isFlipped,
    favorites,
    learned,
    showInstructions,
    loading,
    error,
    current,
    isFavorite,
    isLearned,
    progress,
    isShuffled,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    markAsNeedReview,
    setIsFlipped,
    setShowInstructions,
    fetchFlashcards,
    toggleShuffle,
  }
}

