import { useState, useEffect, useCallback } from 'react'
import { getFlashcardsByTopic } from '../api'
import KoreanImage from '../../../../assets/icon/icon-mainflow/korean.png'

/**
 * Hook xử lý logic cho FlashcardTestScreen
 */
export function useFlashcardTest(topicId) {
  const [flashcards, setFlashcards] = useState([])
  const [originalFlashcards, setOriginalFlashcards] = useState([]) // Lưu thứ tự ban đầu
  const [isShuffled, setIsShuffled] = useState(false) // Track trạng thái random
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [typedAnswers, setTypedAnswers] = useState({}) // Lưu đáp án gõ cho type answer mode
  const [showResults, setShowResults] = useState({})
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allAnswered, setAllAnswered] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  // Settings
  const [questionMode, setQuestionMode] = useState('vietnamese') // 'vietnamese' | 'korean' | 'mix'
  const [answerMode, setAnswerMode] = useState('multipleChoice') // 'multipleChoice' | 'typeAnswer'
  const [showSettings, setShowSettings] = useState(false)

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
      // Reset state khi fetch lại
      setSelectedAnswers({})
      setShowResults({})
      setScore(0)
      setCurrentQuestionIndex(0)
      setIsSubmitted(false)
      setAllAnswered(false)
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
      setOriginalFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  // Tạo câu hỏi từ flashcards dựa trên questionMode
  useEffect(() => {
    if (flashcards.length > 0) {
      const generatedQuestions = flashcards.map((flashcard, index) => {
        // Xác định câu hỏi và đáp án dựa trên questionMode
        let questionText, correctAnswerText
        
        if (questionMode === 'vietnamese') {
          // Câu hỏi: Tiếng Việt, Đáp án: Tiếng Hàn
          questionText = flashcard.meaning
          correctAnswerText = flashcard.word
        } else if (questionMode === 'korean') {
          // Câu hỏi: Tiếng Hàn, Đáp án: Tiếng Việt
          questionText = flashcard.word
          correctAnswerText = flashcard.meaning
        } else {
          // Mix: Random chọn một trong hai
          const isVietnamese = Math.random() < 0.5
          questionText = isVietnamese ? flashcard.meaning : flashcard.word
          correctAnswerText = isVietnamese ? flashcard.word : flashcard.meaning
        }

        // Chỉ tạo options nếu là multiple choice mode
        let options = []
        let correctAnswerId = `correct-${correctAnswerText}`
        
        if (answerMode === 'multipleChoice') {
          // Tạo 3 đáp án sai ngẫu nhiên
          const wrongAnswers = flashcards
            .filter((f, i) => i !== index)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((f) => {
              const wrongText = questionMode === 'vietnamese' 
                ? f.word 
                : questionMode === 'korean'
                ? f.meaning
                : (questionText === f.meaning ? f.word : f.meaning)
              return { id: `wrong-${wrongText}`, text: wrongText }
            })

          // Tạo 4 đáp án (1 đúng + 3 sai)
          options = [
            { id: correctAnswerId, text: correctAnswerText },
            ...wrongAnswers,
          ].sort(() => Math.random() - 0.5)
        }

        return {
          id: `question-${index}`,
          question: questionText,
          correctAnswer: correctAnswerText,
          correctAnswerId: correctAnswerId,
          options: options,
          imageUrl: KoreanImage,
        }
      })
      setQuestions(generatedQuestions)
      // Reset state khi tạo lại câu hỏi
      setSelectedAnswers({})
      setTypedAnswers({})
      setShowResults({})
      setScore(0)
      setCurrentQuestionIndex(0)
      setIsSubmitted(false)
    }
  }, [flashcards, questionMode, answerMode])

  const progress = questions.length > 0 
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) 
    : 0

  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length
    ? questions[currentQuestionIndex]
    : null

  const handleAnswerSelect = (questionId, answerId, isCorrect) => {
    // Chỉ cho phép chọn một lần và chưa nộp bài
    if (selectedAnswers[questionId] || isSubmitted) return

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))

    // Hiển thị đáp án ngay sau khi chọn
    setShowResults((prev) => ({
      ...prev,
      [questionId]: true,
    }))

    // Tự động chuyển câu sau 3 giây (cả đúng và sai)
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        // Nếu là câu cuối, tự động nộp bài
        setIsSubmitted(true)
      }
    }, 3000)
  }

  const handleTypedAnswer = (questionId, typedText) => {
    if (isSubmitted) return

    setTypedAnswers((prev) => ({
      ...prev,
      [questionId]: typedText,
    }))

    const question = questions.find(q => q.id === questionId)
    if (question) {
      const isCorrect = typedText.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
      
      // Hiển thị đáp án ngay sau khi gõ
      setShowResults((prev) => ({
        ...prev,
        [questionId]: true,
      }))

      // Tự động chuyển câu sau 3 giây (cả đúng và sai)
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1)
        } else {
          setIsSubmitted(true)
        }
      }, 3000)
    }
  }

  // Tính lại điểm mỗi khi selectedAnswers hoặc typedAnswers thay đổi
  useEffect(() => {
    if (questions.length === 0) return

    let calculatedScore = 0
    questions.forEach((question) => {
      if (answerMode === 'multipleChoice') {
        const selectedAnswer = selectedAnswers[question.id]
        if (selectedAnswer && selectedAnswer === question.correctAnswerId) {
          calculatedScore++
        }
      } else {
        const typedAnswer = typedAnswers[question.id]
        if (typedAnswer && typedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
          calculatedScore++
        }
      }
    })
    setScore(calculatedScore)
  }, [selectedAnswers, typedAnswers, questions, answerMode])

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (isSubmitted) return
    setIsSubmitted(true)
  }

  // Kiểm tra xem đã trả lời hết chưa
  useEffect(() => {
    if (questions.length > 0 && Object.keys(selectedAnswers).length === questions.length) {
      setAllAnswered(true)
    }
  }, [selectedAnswers, questions.length])

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
    // Reset state khi shuffle
    setSelectedAnswers({})
    setTypedAnswers({})
    setShowResults({})
    setScore(0)
    setCurrentQuestionIndex(0)
    setIsSubmitted(false)
    setAllAnswered(false)
  }, [isShuffled, originalFlashcards])

  const handleSettingsChange = useCallback((newQuestionMode, newAnswerMode) => {
    setQuestionMode(newQuestionMode)
    setAnswerMode(newAnswerMode)
    setShowSettings(false)
  }, [])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  return {
    flashcards,
    questions,
    selectedAnswers,
    typedAnswers,
    showResults,
    score,
    loading,
    error,
    allAnswered,
    isSubmitted,
    progress,
    currentQuestionIndex,
    currentQuestion,
    isShuffled,
    questionMode,
    answerMode,
    showSettings,
    handleAnswerSelect,
    handleTypedAnswer,
    handleSubmit,
    handleNextQuestion,
    handlePreviousQuestion,
    fetchFlashcards,
    toggleShuffle,
    setShowSettings,
    handleSettingsChange,
  }
}

