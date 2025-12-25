import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic, addFavorite, removeFavorite, submitSpacedRepetition } from '../api'

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

  const toggleFavorite = useCallback(async () => {
    if (!current?.id) return
    
    const isCurrentlyFavorite = favorites.has(originalIndex)
    
    try {
      if (isCurrentlyFavorite) {
        // Xóa khỏi danh sách yêu thích
        await removeFavorite(current.id)
        setFavorites((prev) => {
          const next = new Set(prev)
          next.delete(originalIndex)
          return next
        })
      } else {
        // Thêm vào danh sách yêu thích
        await addFavorite(current.id)
        setFavorites((prev) => {
          const next = new Set(prev)
          next.add(originalIndex)
          return next
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Có thể hiển thị thông báo lỗi cho người dùng ở đây
    }
  }, [current, originalIndex, favorites])

  const markAsLearned = useCallback(async () => {
    if (originalIndex !== undefined && current?.id) {
      try {
        // QualityVocab: 2 (Easy) - Nhớ lại dễ dàng
        await submitSpacedRepetition(current.id, 2)
        setLearned((prev) => {
          const next = new Set(prev)
          next.add(originalIndex)
          return next
        })
      } catch (error) {
        console.error('Error submitting spaced repetition:', error)
        // Vẫn cập nhật UI nếu API thất bại
        setLearned((prev) => {
          const next = new Set(prev)
          next.add(originalIndex)
          return next
        })
      }
    }
  }, [current, originalIndex])

  const markAsNeedReview = useCallback(async () => {
    if (originalIndex !== undefined && current?.id) {
      try {
        // QualityVocab: 0 (Again) - Chưa nhớ lại được
        await submitSpacedRepetition(current.id, 0)
        setLearned((prev) => {
          const next = new Set(prev)
          next.delete(originalIndex)
          return next
        })
      } catch (error) {
        console.error('Error submitting spaced repetition:', error)
        // Vẫn cập nhật UI nếu API thất bại
        setLearned((prev) => {
          const next = new Set(prev)
          next.delete(originalIndex)
          return next
        })
      }
    }
  }, [current, originalIndex])

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

