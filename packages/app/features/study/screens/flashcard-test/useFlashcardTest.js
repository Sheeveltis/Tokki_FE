import { useState, useEffect, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { getFlashcardsByTopic, getFavoriteVocabularies, submitSpacedRepetition } from '@tokki/app/features/study/api'
import KoreanImage from 'assets/icon/icon-mainflow/korean.png'

/**
 * Hook xử lý logic cho FlashcardTestScreen
 * @param {string|null} topicId - Topic ID hoặc null nếu là chế độ favorites
 * @param {boolean} isFavoritesMode - Nếu true, sẽ fetch từ vựng yêu thích thay vì theo topic
 * @param {{ forceAnswerMode?: 'multipleChoice' | 'typeAnswer' | 'mix', enableParts?: boolean, questionsPerPart?: number }} [options] - Tùy chọn cấu hình
 */
export function useFlashcardTest(topicId, isFavoritesMode = false, options = {}) {
  const { forceAnswerMode, enableParts = false, questionsPerPart = 10, disableSubmit = false } = options
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
  // Parts management (chia bài học thành các part nhỏ)
  const [allQuestions, setAllQuestions] = useState([]) // Lưu tất cả câu hỏi
  const [parts, setParts] = useState([]) // Danh sách các parts
  const [currentPart, setCurrentPart] = useState(0) // Part hiện tại (0-based)
  // Settings
  const [questionMode, setQuestionMode] = useState('vietnamese') // 'vietnamese' | 'korean' | 'mix'
  // Nếu có forceAnswerMode (ví dụ trong mode kiểm tra), luôn dùng mode đó
  const [answerMode, setAnswerMode] = useState(forceAnswerMode || 'multipleChoice') // 'multipleChoice' | 'typeAnswer' | 'mix'
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
      setAllQuestions([])
      setParts([])
      setCurrentPart(0)
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
      const generatedQuestions = []
      
      flashcards.forEach((flashcard, index) => {
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

        const correctAnswerId = `correct-${correctAnswerText}`
        
        // Nếu answerMode = 'mix':
        // - Quiz mode (enableParts = true): tạo 2 câu hỏi cho mỗi flashcard (MC và TA)
        // - Test mode (enableParts = false): mỗi từ chỉ tạo 1 câu hỏi (random MC hoặc TA)
        if (answerMode === 'mix') {
          if (enableParts) {
            // Quiz mode: tạo 2 câu hỏi cho mỗi flashcard
            // Câu hỏi 1: Multiple Choice
            const wrongAnswersMC = flashcards
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

            const optionsMC = [
              { id: correctAnswerId, text: correctAnswerText },
              ...wrongAnswersMC,
            ].sort(() => Math.random() - 0.5)

            generatedQuestions.push({
              id: `${flashcard.id || `question-${index}`}-mc`,
              vocabularyId: flashcard.id,
              question: questionText,
              correctAnswer: correctAnswerText,
              correctAnswerId: correctAnswerId,
              options: optionsMC,
              imageUrl: flashcard.imageUrl || KoreanImage,
              answerType: 'multipleChoice',
            })

            // Câu hỏi 2: Type Answer
            generatedQuestions.push({
              id: `${flashcard.id || `question-${index}`}-ta`,
              vocabularyId: flashcard.id,
              question: questionText,
              correctAnswer: correctAnswerText,
              correctAnswerId: correctAnswerId,
              options: [],
              imageUrl: flashcard.imageUrl || KoreanImage,
              answerType: 'typeAnswer',
            })
          } else {
            // Test mode: mỗi từ chỉ tạo 1 câu hỏi (random MC hoặc TA)
            const questionAnswerType = Math.random() < 0.5 ? 'multipleChoice' : 'typeAnswer'
            let options = []
            
            if (questionAnswerType === 'multipleChoice') {
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

            generatedQuestions.push({
              id: flashcard.id || `question-${index}`,
              vocabularyId: flashcard.id,
              question: questionText,
              correctAnswer: correctAnswerText,
              correctAnswerId: correctAnswerId,
              options: options,
              imageUrl: flashcard.imageUrl || KoreanImage,
              answerType: questionAnswerType,
            })
          }
        } else {
          // Nếu không phải mix, chỉ tạo 1 câu hỏi như cũ
          let options = []
          
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

          generatedQuestions.push({
            id: flashcard.id || `question-${index}`,
            vocabularyId: flashcard.id,
            question: questionText,
            correctAnswer: correctAnswerText,
            correctAnswerId: correctAnswerId,
            options: options,
            imageUrl: flashcard.imageUrl || KoreanImage,
            answerType: answerMode,
          })
        }
      })
      
      // Shuffle logic:
      // - Quiz mode (enableParts = true): shuffle riêng từng nhóm (MC trước, TA sau)
      // - Test mode (enableParts = false): shuffle tất cả câu hỏi lại với nhau (trộn MC và TA)
      let finalQuestions = []
      const shuffleArray = (arr) => {
        const shuffled = [...arr]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
      }
      
      if (answerMode === 'mix') {
        if (enableParts) {
          // Quiz mode: shuffle riêng từng nhóm (MC trước, TA sau)
          const multipleChoiceQuestions = generatedQuestions.filter(q => q.answerType === 'multipleChoice')
          const typeAnswerQuestions = generatedQuestions.filter(q => q.answerType === 'typeAnswer')
          
          const shuffledMC = shuffleArray(multipleChoiceQuestions)
          const shuffledTA = shuffleArray(typeAnswerQuestions)
          
          // Ghép lại: trắc nghiệm trước, sau đó gõ đáp án
          finalQuestions = [...shuffledMC, ...shuffledTA]
        } else {
          // Test mode: shuffle tất cả câu hỏi lại với nhau (trộn MC và TA)
          finalQuestions = shuffleArray(generatedQuestions)
        }
      } else {
        // Nếu không phải mix, shuffle tất cả như bình thường
        const shuffledQuestions = [...generatedQuestions]
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]]
        }
        finalQuestions = shuffledQuestions
      }
      
      // Lưu tất cả câu hỏi
      setAllQuestions(finalQuestions)
      
      // Nếu enableParts, chia thành các parts
      if (enableParts && finalQuestions.length > 0) {
        const partsArray = []
        for (let i = 0; i < finalQuestions.length; i += questionsPerPart) {
          partsArray.push(finalQuestions.slice(i, i + questionsPerPart))
        }
        setParts(partsArray)
        setCurrentPart(0)
        // Hiển thị câu hỏi của part đầu tiên
        setQuestions(partsArray[0] || [])
      } else {
        // Không chia part, hiển thị tất cả
        setQuestions(finalQuestions)
        setParts([])
        setCurrentPart(0)
      }
      // Reset state khi tạo lại câu hỏi
      setSelectedAnswers({})
      setTypedAnswers({})
      setShowResults({})
      setScore(0)
      setCurrentQuestionIndex(0)
      setIsSubmitted(false)
    }
  }, [flashcards, questionMode, answerMode, enableParts, questionsPerPart])

  // Tính số câu đã làm (đã trả lời) từ TẤT CẢ câu hỏi (không chỉ part hiện tại)
  const allAnsweredCount = answerMode === 'mix'
    ? allQuestions.filter(q => {
        const isMultipleChoice = q.answerType === 'multipleChoice'
        return isMultipleChoice 
          ? selectedAnswers[q.id] !== undefined
          : typedAnswers[q.id]?.trim() !== undefined && typedAnswers[q.id]?.trim() !== ''
      }).length
    : answerMode === 'multipleChoice'
    ? Object.keys(selectedAnswers).length
    : Object.keys(typedAnswers).filter(id => typedAnswers[id]?.trim()).length

  // Progress tính dựa trên số câu đã làm trên TẤT CẢ câu hỏi
  const progress = allQuestions.length > 0 
    ? Math.round((allAnsweredCount / allQuestions.length) * 100) 
    : 0

  // Tính toán thông tin part
  const totalParts = enableParts ? parts.length : 1
  const currentPartQuestions = enableParts ? (parts[currentPart] || []) : questions
  const currentPartAnsweredCount = enableParts
    ? currentPartQuestions.filter(q => {
        const questionAnswerType = answerMode === 'mix' ? q.answerType : answerMode
        return questionAnswerType === 'multipleChoice'
          ? selectedAnswers[q.id] !== undefined
          : typedAnswers[q.id]?.trim() !== undefined && typedAnswers[q.id]?.trim() !== ''
      }).length
    : allAnsweredCount
  const currentPartProgress = enableParts && currentPartQuestions.length > 0
    ? Math.round((currentPartAnsweredCount / currentPartQuestions.length) * 100)
    : progress

  // Lấy câu hỏi hiện tại từ questions (đã được filter theo part nếu enableParts)
  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length
    ? questions[currentQuestionIndex]
    : null
  
  // answeredCount để tương thích với code cũ
  const answeredCount = allAnsweredCount

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

    // Gọi API spaced repetition (trừ khi disableSubmit = true)
    const question = questions.find(q => q.id === questionId)
    if (!disableSubmit && question?.vocabularyId) {
      try {
        // QualityVocab: 0 (Again) nếu sai, 2 (Easy) nếu đúng
        const quality = isCorrect ? 2 : 0
        await submitSpacedRepetition(question.vocabularyId, quality)
      } catch (error) {
        console.error('Error submitting spaced repetition:', error)
        // Không block UI nếu API thất bại
      }
    }

    // Tự động chuyển câu sau 3 giây chỉ khi không phải quiz mode (enableParts = false)
    // Quiz mode: người dùng sẽ nhấn phím bất kỳ để chuyển câu
    if (!enableParts) {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex((prev) => {
          if (prev < questions.length - 1) {
            return prev + 1
          } else {
            // Nếu là câu cuối, tự động nộp bài
            setIsSubmitted(true)
            const allResults = {}
            allQuestions.forEach((question) => {
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
  }, [selectedAnswers, isSubmitted, questions, enableParts, allQuestions, disableSubmit])

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

      // Gọi API spaced repetition (trừ khi disableSubmit = true)
      if (!disableSubmit && question.vocabularyId) {
        try {
          // QualityVocab: 0 (Again) nếu sai, 2 (Easy) nếu đúng hoàn toàn
          const quality = isCorrect ? 2 : 0
          await submitSpacedRepetition(question.vocabularyId, quality)
        } catch (error) {
          console.error('Error submitting spaced repetition:', error)
          // Không block UI nếu API thất bại
        }
      }

      // Tự động chuyển câu sau 3 giây chỉ khi không phải quiz mode (enableParts = false)
      // Quiz mode: người dùng sẽ nhấn phím bất kỳ để chuyển câu
      if (!enableParts) {
        const timer = setTimeout(() => {
          setCurrentQuestionIndex((prev) => {
            if (prev < questions.length - 1) {
              return prev + 1
            } else {
              // Nếu là câu cuối, tự động nộp bài
              setIsSubmitted(true)
              const allResults = {}
              allQuestions.forEach((question) => {
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
    }
  }, [isSubmitted, questions, disableSubmit])

  // Tính lại điểm mỗi khi selectedAnswers hoặc typedAnswers thay đổi
  // Tính điểm từ TẤT CẢ câu hỏi, không chỉ part hiện tại
  useEffect(() => {
    if (allQuestions.length === 0) return

    let calculatedScore = 0
    allQuestions.forEach((question) => {
      // Xác định loại câu trả lời cho câu hỏi này
      const questionAnswerType = answerMode === 'mix' 
        ? question.answerType 
        : answerMode

      if (questionAnswerType === 'multipleChoice') {
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
  }, [selectedAnswers, typedAnswers, allQuestions, answerMode])

  const handleNextQuestion = useCallback(() => {
    const currentQuestions = enableParts ? (parts[currentPart] || []) : questions
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else if (enableParts && currentPart < parts.length - 1) {
      // Chuyển sang part tiếp theo
      setCurrentPart((part) => {
        const nextPart = part + 1
        setQuestions(parts[nextPart] || [])
        setCurrentQuestionIndex(0)
        return nextPart
      })
    } else if (enableParts && currentPart === parts.length - 1 && currentQuestionIndex === currentQuestions.length - 1) {
      // Nếu là câu cuối của part cuối, tự động nộp bài
      setIsSubmitted(true)
      const allResults = {}
      allQuestions.forEach((question) => {
        allResults[question.id] = true
      })
      setShowResults(allResults)
    }
  }, [enableParts, parts, currentPart, currentQuestionIndex, questions, allQuestions])
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    } else if (enableParts && currentPart > 0) {
      // Chuyển về part trước
      setCurrentPart((part) => {
        const prevPart = part - 1
        setQuestions(parts[prevPart] || [])
        setCurrentQuestionIndex(parts[prevPart]?.length - 1 || 0)
        return prevPart
      })
    }
  }
  
  const handlePartChange = (partIndex) => {
    if (enableParts && partIndex >= 0 && partIndex < parts.length) {
      setCurrentPart(partIndex)
      setQuestions(parts[partIndex] || [])
      setCurrentQuestionIndex(0)
    }
  }

  const handleSubmit = () => {
    if (isSubmitted) return
    setIsSubmitted(true)
    // Hiển thị kết quả cho tất cả câu hỏi sau khi nộp bài
    const allResults = {}
    allQuestions.forEach((question) => {
      allResults[question.id] = true
    })
    setShowResults(allResults)
  }

  // Kiểm tra xem đã trả lời hết chưa (tất cả câu hỏi)
  useEffect(() => {
    if (allQuestions.length > 0) {
      const totalAnswered = answerMode === 'mix'
        ? allQuestions.filter(q => {
            const isMultipleChoice = q.answerType === 'multipleChoice'
            return isMultipleChoice 
              ? selectedAnswers[q.id] !== undefined
              : typedAnswers[q.id]?.trim() !== undefined && typedAnswers[q.id]?.trim() !== ''
          }).length
        : answerMode === 'multipleChoice'
        ? Object.keys(selectedAnswers).length
        : Object.keys(typedAnswers).filter(id => typedAnswers[id]?.trim()).length
      
      setAllAnswered(totalAnswered === allQuestions.length)
    }
  }, [selectedAnswers, typedAnswers, allQuestions.length, answerMode])

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
    // Nếu không bị khóa answerMode thì mới cho phép thay đổi
    if (!forceAnswerMode) {
      setAnswerMode(newAnswerMode)
    }
    setShowSettings(false)
  }, [forceAnswerMode])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  // Thêm keyboard event listener cho quiz mode
  useEffect(() => {
    if (!enableParts || isSubmitted || typeof window === 'undefined') return

    const handleKeyDown = (event) => {
      const currentQuestions = parts[currentPart] || []
      const currentQ = currentQuestions[currentQuestionIndex]
      if (!currentQ) return
      
      // Chỉ chuyển câu khi đã hiện đáp án
      if (showResults[currentQ.id]) {
        handleNextQuestion()
      }
    }

    // Chỉ thêm event listener trên web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        if (typeof window.removeEventListener === 'function') {
          window.removeEventListener('keydown', handleKeyDown)
        }
      }
    }
  }, [enableParts, isSubmitted, parts, currentPart, currentQuestionIndex, showResults, handleNextQuestion])

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
    // Parts management
    enableParts,
    parts,
    currentPart,
    totalParts,
    currentPartQuestions,
    currentPartAnsweredCount,
    currentPartProgress,
    handlePartChange,
    allQuestions,
  }
}

