import { useState, useEffect } from 'react'
import alphabetStrokesData from './alphabet-strokes.json'

/**
 * Hook quản lý logic cho màn hình tập vẽ chữ cái Hàn Quốc
 * - Load dữ liệu từ JSON
 * - Quản lý chữ cái hiện tại
 * - Quản lý trạng thái hiển thị guide
 */
export function useAlphabetDrawing() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showGuide, setShowGuide] = useState(true) // Hiển thị guide mặc định
  const [data, setData] = useState([])

  useEffect(() => {
    // Load dữ liệu từ JSON
    setData(alphabetStrokesData)
  }, [])

  const current = data[currentIndex] || null

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSelectLetter = (index) => {
    if (index >= 0 && index < data.length) {
      setCurrentIndex(index)
    }
  }

  const toggleGuide = () => {
    setShowGuide(!showGuide)
  }

  return {
    data,
    current,
    currentIndex,
    total: data.length,
    showGuide,
    handleNext,
    handlePrev,
    handleSelectLetter,
    toggleGuide,
  }
}

