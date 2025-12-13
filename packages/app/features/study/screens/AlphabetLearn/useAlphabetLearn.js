import { useState } from 'react'
import { ALPHABET_LETTERS } from '../../mockData'

/**
 * Hook xử lý logic cho AlphabetLearnScreen
 */
export function useAlphabetLearn() {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())

  const current = ALPHABET_LETTERS[index % ALPHABET_LETTERS.length] || {}
  const isFavorite = favorites.has(index)
  const isLearned = learned.has(index)
  const progress = ALPHABET_LETTERS.length > 0 ? Math.round((learned.size / ALPHABET_LETTERS.length) * 100) : 0

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % ALPHABET_LETTERS.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + ALPHABET_LETTERS.length) % ALPHABET_LETTERS.length)
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
    index,
    isFlipped,
    favorites,
    learned,
    current,
    isFavorite,
    isLearned,
    progress,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    setIsFlipped,
  }
}

