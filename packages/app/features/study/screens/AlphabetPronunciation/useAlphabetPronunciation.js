import { useState } from 'react'
import { ALPHABET_LETTERS } from '../../mockData'

/**
 * Hook xử lý logic cho AlphabetPronunciationScreen
 */
export function useAlphabetPronunciation() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const current = ALPHABET_LETTERS[index % ALPHABET_LETTERS.length] || {}

  const handleNext = () => {
    setIsPlaying(false)
    setIndex((prev) => (prev + 1) % ALPHABET_LETTERS.length)
  }

  const handlePrev = () => {
    setIsPlaying(false)
    setIndex((prev) => (prev - 1 + ALPHABET_LETTERS.length) % ALPHABET_LETTERS.length)
  }

  const handlePlay = () => {
    setIsPlaying(true)
    // TODO: Thêm logic phát âm thực tế khi có API
    // Có thể sử dụng Web Speech API hoặc audio file
    setTimeout(() => setIsPlaying(false), 1000)
  }

  return {
    index,
    isPlaying,
    current,
    handleNext,
    handlePrev,
    handlePlay,
  }
}

