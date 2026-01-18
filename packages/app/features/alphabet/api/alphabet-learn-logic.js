import { useState, useEffect } from 'react'
import { ALPHABET_LETTERS } from '../../study/mockData'

/**
 * Hook xử lý logic cho AlphabetLearnScreen
 */
export function useAlphabetLearn() {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [showInstructions, setShowInstructions] = useState(false)

  // Filter flashcards: chỉ lấy những card chưa học
  const unlearnedIndices = ALPHABET_LETTERS
    .map((_, idx) => idx)
    .filter((idx) => !learned.has(idx))

  // Map index trong unlearned list về index gốc trong ALPHABET_LETTERS
  const originalIndex = unlearnedIndices[index % unlearnedIndices.length]
  const current = ALPHABET_LETTERS[originalIndex] || {}
  const isFavorite = originalIndex !== undefined ? favorites.has(originalIndex) : false
  const isLearned = originalIndex !== undefined ? learned.has(originalIndex) : false
  const progress = ALPHABET_LETTERS.length > 0 ? Math.round((learned.size / ALPHABET_LETTERS.length) * 100) : 0

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
    if (originalIndex !== undefined) {
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

  return {
    index,
    isFlipped,
    favorites,
    learned,
    unlearnedCount: unlearnedIndices.length,
    current,
    isFavorite,
    isLearned,
    progress,
    showInstructions,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    markAsNeedReview,
    setIsFlipped,
    setShowInstructions,
  }
}

