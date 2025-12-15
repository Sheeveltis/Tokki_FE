import { useState } from 'react'
import { ALPHABET_LETTERS } from '../../mockData'

/**
 * Hook xử lý logic cho AlphabetStudyScreen
 */
export function useAlphabetStudy(mode = 'letters') {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  // TODO: Thay đổi data source dựa trên mode
  const data = mode === 'letters' ? ALPHABET_LETTERS : ALPHABET_LETTERS // Tạm thời dùng ALPHABET_LETTERS cho cả 2
  const current = data[index % data.length] || {}
  const isFavorite = favorites.has(index)
  const modeTitle = mode === 'letters' ? 'Học Chữ Cái' : 'Học Ghép Âm'

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % data.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  const handleSelectLetter = (newIndex) => {
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
    data,
    current,
    isFavorite,
    modeTitle,
    handleNext,
    handlePrev,
    handleSelectLetter,
    toggleFavorite,
    setIsFlipped,
  }
}

