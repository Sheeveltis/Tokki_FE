import { useState } from 'react'
import { FLASHCARDS } from '../../mockData'

/**
 * Hook xử lý logic cho FlashcardStudyScreen
 */
export function useFlashcardStudy() {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  const current = FLASHCARDS[index % FLASHCARDS.length] || {}
  const isFavorite = favorites.has(index)

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % FLASHCARDS.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length)
  }

  const handleSelectFlashcard = (newIndex) => {
    setIsFlipped(false)
    setIndex(newIndex)
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

  return {
    index,
    isFlipped,
    favorites,
    current,
    isFavorite,
    handleNext,
    handlePrev,
    handleSelectFlashcard,
    toggleFavorite,
    setIsFlipped,
  }
}

