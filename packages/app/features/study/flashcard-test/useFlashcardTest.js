import { useState, useEffect, useCallback, useRef } from 'react'
import { getFlashcardsByTopic, getFavoriteVocabularies, submitSpacedRepetition } from '../api'
import KoreanImage from '../../../../assets/icon/icon-mainflow/korean.png'

/**
 * Hook xử lý logic cho FlashcardTestScreen
 * @param {string|null} topicId - Topic ID hoặc null nếu là chế độ favorites
 * @param {boolean} isFavoritesMode - Nếu true, sẽ fetch từ vựng yêu thích thay vì theo topic
 */
export function useFlashcardTest(topicId, isFavoritesMode = false) {
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

  // Ref để lưu timers và cleanup khi cần
  const timersRef = useRef([])

  // Cleanup tất cả timers khi component unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        if (timer) clearTimeout(timer)
      })
      timersRef.current = []
    }
  }, [])

  // Fetch flashcards từ API
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
          setOriginalFlashcards([])
          setLoading(false)
          setError('Thiếu thông tin chủ đề')
          return
        }
        data = await getFlashcardsByTopic(topicId)
      }
      
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
  }, [topicId, isFavoritesMode])

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
          id: flashcard.id || `question-${index}`, // Sử dụng flashcard.id nếu có, fallback về question-${index}
          vocabularyId: flashcard.id, // Lưu vocabularyId để dễ truy cập
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

  // Tính số câu đã làm (đã trả lời)
  const answeredCount = answerMode === 'multipleChoice'
    ? Object.keys(selectedAnswers).length
    : Object.keys(typedAnswers).filter(id => typedAnswers[id]?.trim()).length

  // Progress tính dựa trên số câu đã làm, không phải số câu đã xem
  const progress = questions.length > 0 
    ? Math.round((answeredCount / questions.length) * 100) 
    : 0

  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length
    ? questions[currentQuestionIndex]
    : null

  const handleAnswerSelect = useCallback(async (questionId, answerId, isCorrect) => {
    // Chỉ cho phép chọn một lần và chưa nộp bài
    if (selectedAnswers[questionId] || isSubmitted) return

    // Clear timers cũ trước khi tạo timer mới
    timersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    timersRef.current = []

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }))

    // Hiển thị đáp án ngay sau khi chọn
    setShowResults((prev) => ({
      ...prev,
      [questionId]: true,
    }))

    // Gọi API spaced repetition
    const question = questions.find(q => q.id === questionId)
    if (question?.vocabularyId) {
      try {
        // QualityVocab: 0 (Again) nếu sai, 2 (Easy) nếu đúng
        const quality = isCorrect ? 2 : 0
        await submitSpacedRepetition(question.vocabularyId, quality)
      } catch (error) {
        console.error('Error submitting spaced repetition:', error)
        // Không block UI nếu API thất bại
      }
    }

    // Tự động chuyển câu sau 3 giây (cả đúng và sai)
    const timer = setTimeout(() => {
      setCurrentQuestionIndex((prev) => {
        if (prev < questions.length - 1) {
          return prev + 1
        } else {
          // Nếu là câu cuối, tự động nộp bài và hiển thị kết quả cho tất cả câu hỏi
          setIsSubmitted(true)
          const allResults = {}
          questions.forEach((question) => {
            allResults[question.id] = true
          })
          setShowResults(allResults)
          return prev
        }
      })
    }, 3000)

    // Lưu timer vào ref để cleanup sau
    timersRef.current.push(timer)
  }, [selectedAnswers, isSubmitted, questions])

  const handleTypedAnswer = useCallback(async (questionId, typedText) => {
    if (isSubmitted) return

    // Clear timers cũ trước khi tạo timer mới
    timersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer)
    })
    timersRef.current = []

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

      // Gọi API spaced repetition
      if (question.vocabularyId) {
        try {
          // QualityVocab: 0 (Again) nếu sai, 2 (Easy) nếu đúng hoàn toàn
          const quality = isCorrect ? 2 : 0
          await submitSpacedRepetition(question.vocabularyId, quality)
        } catch (error) {
          console.error('Error submitting spaced repetition:', error)
          // Không block UI nếu API thất bại
        }
      }

      // Tự động chuyển câu sau 3 giây (cả đúng và sai)
      const timer = setTimeout(() => {
        setCurrentQuestionIndex((prev) => {
          if (prev < questions.length - 1) {
            return prev + 1
          } else {
            // Nếu là câu cuối, tự động nộp bài và hiển thị kết quả cho tất cả câu hỏi
            setIsSubmitted(true)
            const allResults = {}
            questions.forEach((question) => {
              allResults[question.id] = true
            })
            setShowResults(allResults)
            return prev
          }
        })
      }, 3000)

      // Lưu timer vào ref để cleanup sau
      timersRef.current.push(timer)
    }
  }, [isSubmitted, questions])

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
    // Hiển thị kết quả cho tất cả câu hỏi sau khi nộp bài
    const allResults = {}
    questions.forEach((question) => {
      allResults[question.id] = true
    })
    setShowResults(allResults)
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
    answeredCount,
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

