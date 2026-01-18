import { useState, useEffect } from 'react'
import { ALPHABET_LETTERS } from '../../study/mockData'
import KoreanImage from '../../../../assets/icon/icon-mainflow/korean.png'

/**
 * Hook xử lý logic cho AlphabetTestScreen
 */
export function useAlphabetTest() {
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState({})
  const [score, setScore] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Tạo câu hỏi từ chữ cái
  useEffect(() => {
    if (ALPHABET_LETTERS.length > 0) {
      const generatedQuestions = ALPHABET_LETTERS.map((letter, index) => {
        // Tạo 3 đáp án sai ngẫu nhiên
        const wrongAnswers = ALPHABET_LETTERS
          .filter((l, i) => i !== index)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((l) => ({ id: `wrong-${l.word}`, text: l.word }))

        // Tạo 4 đáp án (1 đúng + 3 sai)
        const allAnswers = [
          { id: `correct-${letter.word}`, text: letter.word },
          ...wrongAnswers,
        ].sort(() => Math.random() - 0.5)

        return {
          id: `question-${index}`,
          question: `${letter.meaning} (${letter.pronunciation})`,
          correctAnswerId: `correct-${letter.word}`,
          options: allAnswers,
          imageUrl: KoreanImage,
        }
      })
      setQuestions(generatedQuestions)
    }
  }, [])

  const progress = questions.length > 0 
    ? Math.round((Object.keys(selectedAnswers).length / questions.length) * 100) 
    : 0

  const handleAnswerSelect = (questionId, answerId, isCorrect) => {
    if (selectedAnswers[questionId] || isSubmitted) return

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))
  }

  const handleSubmit = () => {
    if (isSubmitted) return

    let calculatedScore = 0
    const results = {}

    questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id]
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

  return {
    questions,
    selectedAnswers,
    showResults,
    score,
    isSubmitted,
    progress,
    handleAnswerSelect,
    handleSubmit,
  }
}

