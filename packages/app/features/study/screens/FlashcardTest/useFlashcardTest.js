import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic } from '../../api'
import KoreanImage from '../../../../../assets/icon/icon-mainflow/korean.png'

/**
 * Hook xử lý logic cho FlashcardTestScreen
 */
export function useFlashcardTest(topicId) {
  const [flashcards, setFlashcards] = useState([])
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState({})
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allAnswered, setAllAnswered] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch flashcards từ API
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      setFlashcards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  // Tạo câu hỏi từ flashcards
  useEffect(() => {
    if (flashcards.length > 0) {
      const generatedQuestions = flashcards.map((flashcard, index) => {
        // Tạo 3 đáp án sai ngẫu nhiên
        const wrongAnswers = flashcards
          .filter((f, i) => i !== index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((f) => ({ id: `wrong-${f.word}`, text: f.word }))

        // Tạo 4 đáp án (1 đúng + 3 sai)
        const allAnswers = [
          { id: `correct-${flashcard.word}`, text: flashcard.word },
          ...wrongAnswers,
        ].sort(() => Math.random() - 0.5)

        return {
          id: `question-${index}`,
          question: flashcard.meaning,
          correctAnswerId: `correct-${flashcard.word}`,
          options: allAnswers,
          imageUrl: KoreanImage, // Có thể thay bằng hình ảnh từ flashcard nếu có
        }
      })
      setQuestions(generatedQuestions)
    }
  }, [flashcards])

  const progress = questions.length > 0 
    ? Math.round((Object.keys(selectedAnswers).length / questions.length) * 100) 
    : 0

  const handleAnswerSelect = (questionId, answerId, isCorrect) => {
    // Chỉ cho phép chọn một lần và chưa nộp bài
    if (selectedAnswers[questionId] || isSubmitted) return

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleSubmit = () => {
    if (isSubmitted) return

    // Tính điểm và hiển thị kết quả cho tất cả câu hỏi
    let calculatedScore = 0
    const results = {}

    questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id]
      // Đánh dấu tất cả câu hỏi để hiển thị đáp án đúng
      results[question.id] = true
      if (selectedAnswer) {
        const isCorrect = selectedAnswer === question.correctAnswerId
        if (isCorrect) {
          calculatedScore++
        }
      }
    })

    setScore(calculatedScore)
    setShowResults(results)
    setIsSubmitted(true)
  }

  // Kiểm tra xem đã trả lời hết chưa
  useEffect(() => {
    if (questions.length > 0 && Object.keys(selectedAnswers).length === questions.length) {
      setAllAnswered(true)
    }
  }, [selectedAnswers, questions.length])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  return {
    flashcards,
    questions,
    selectedAnswers,
    showResults,
    score,
    loading,
    error,
    allAnswered,
    isSubmitted,
    progress,
    handleAnswerSelect,
    handleSubmit,
    fetchFlashcards,
  }
}

