import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic, getFavoriteVocabularies, addFavorite, removeFavorite } from '../api'

/**
 * Hook xử lý logic cho FlashcardStudyScreen
 * @param {string|null} topicId - Topic ID hoặc null nếu là chế độ favorites
 * @param {boolean} isFavoritesMode - Nếu true, sẽ fetch từ vựng yêu thích thay vì theo topic
 */
export function useFlashcardStudy(topicId, isFavoritesMode = false) {
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
      
      let data
      if (isFavoritesMode) {
        // Fetch từ vựng yêu thích
        data = await getFavoriteVocabularies()
      } else {
        // Fetch từ vựng theo topic
        if (!topicId) {
          setFlashcards([])
          setLoading(false)
          setError('Thiếu thông tin chủ đề')
          return
        }
        data = await getFlashcardsByTopic(topicId)
      }
      
      const flashcardsArray = Array.isArray(data) ? data : []
      setFlashcards(flashcardsArray)
      setIndex(0)
      setIsFlipped(false)
      // Trong chế độ favorites, tất cả đều là favorite
      if (isFavoritesMode) {
        setFavorites(new Set(flashcardsArray.map((_, idx) => idx)))
      } else {
        setFavorites(new Set())
      }
      setLearned(new Set())
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId, isFavoritesMode])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  // Filter flashcards: chỉ lấy những card chưa học (trừ khi là chế độ favorites)
  const unlearnedFlashcards = isFavoritesMode 
    ? flashcards 
    : flashcards.filter((_, idx) => !learned.has(idx))
  const unlearnedIndices = isFavoritesMode
    ? flashcards.map((_, idx) => idx)
    : flashcards
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

  const toggleFavorite = useCallback(async () => {
    if (originalIndex === undefined || !current?.id) return
    
    const isCurrentlyFavorite = favorites.has(originalIndex)
    
    try {
      if (isCurrentlyFavorite) {
        // Xóa khỏi danh sách yêu thích
        await removeFavorite(current.id)
        
        if (isFavoritesMode) {
          // Trong chế độ favorites, xóa từ vựng khỏi danh sách
          const newFlashcards = flashcards.filter((_, idx) => idx !== originalIndex)
          setFlashcards(newFlashcards)
          // Trong chế độ favorites, tất cả đều là favorite, nên cập nhật lại set
          setFavorites(new Set(newFlashcards.map((_, idx) => idx)))
          // Reset index nếu cần
          if (newFlashcards.length > 0) {
            const currentIndexInUnlearned = unlearnedIndices.findIndex(idx => idx === originalIndex)
            if (currentIndexInUnlearned !== -1) {
              // Nếu đang ở từ vựng bị xóa, chuyển sang từ vựng trước hoặc sau
              if (currentIndexInUnlearned >= newFlashcards.length) {
                setIndex(Math.max(0, newFlashcards.length - 1))
              } else {
                setIndex(currentIndexInUnlearned)
              }
            }
          } else {
            setIndex(0)
          }
        } else {
          // Trong chế độ bình thường, chỉ cập nhật state favorite
          setFavorites((prev) => {
            const next = new Set(prev)
            next.delete(originalIndex)
            return next
          })
        }
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
  }, [current, originalIndex, favorites, isFavoritesMode])

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

