import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { completeTopic, getFlashcardsByTopic, submitSpacedRepetition } from '../api'

const STEPS = ['view', 'listen', 'meaning'] // 0,1,2
const MAX_ATTEMPTS_PER_WORD = 2 // 1 lần học + 1 lần học lại ở cuối

export function useFlashcardFirstLearn(topicId) {
  // Queue học: danh sách gốc + các từ cần học lại được append xuống cuối
  const [queue, setQueue] = useState([])
  const [originalTotal, setOriginalTotal] = useState(0) // Tổng số từ ban đầu
  const [completedWords, setCompletedWords] = useState(new Set()) // Set các từ đã hoàn thành cả 3 bước đúng
  const [isTopicCompleted, setIsTopicCompleted] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(0) // Số bước đã hoàn thành (view/listen/meaning)
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [stepResults, setStepResults] = useState({ listen: null, meaning: null })

  const audioRef = useRef(null)

  // Track số lần 1 từ đã xuất hiện trong queue (để tránh loop vô hạn)
  const attemptsRef = useRef(new Map()) // key: vocabularyId, value: number
  const completedTopicRef = useRef(false)

  const current = queue[index] || null
  const total = queue.length

  const currentStepKey = useMemo(() => STEPS[step] || 'view', [step])

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause()
      } catch (e) {
        // ignore
      }
      audioRef.current = null
    }
  }, [])

  const playAudio = useCallback(() => {
    if (!current?.audioUrl || Platform.OS !== 'web') return
    cleanupAudio()
    const audio = new Audio(current.audioUrl)
    audioRef.current = audio
    audio.play().catch((err) => {
      console.error('Error playing audio:', err)
    })
    audio.addEventListener('ended', () => {
      audioRef.current = null
    })
  }, [cleanupAudio, current])

  const fetchFlashcards = useCallback(async () => {
    if (!topicId) {
      setError('Thiếu thông tin chủ đề')
      setQueue([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      const base = Array.isArray(data) ? data : []
      setQueue(base)
      setOriginalTotal(base.length)
      setCompletedWords(new Set())
      setCompletedSteps(0)
      setIsTopicCompleted(false)
      setIndex(0)
      setStep(0)
      setIsFlipped(false)
      setHasFlippedOnce(false)
      setUserAnswer('')
      setShowResult(false)
      setIsCorrect(false)
      setStepResults({ listen: null, meaning: null })
      attemptsRef.current = new Map()
      completedTopicRef.current = false
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setQueue([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    fetchFlashcards()
    return cleanupAudio
  }, [fetchFlashcards, cleanupAudio])

  // Auto play when entering any step
  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => {
      playAudio()
    }, 200)
    return () => clearTimeout(timer)
  }, [current, step, playAudio])

  const resetForNextStep = () => {
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setIsFlipped(false)
    setHasFlippedOnce(false)
  }

  const handleSubmit = () => {
    if (currentStepKey === 'view') {
      // Bước 1 không có submit, chỉ cần flip
      return
    }
    if (!userAnswer.trim()) return

    const normalizedAnswer = userAnswer.trim().toLowerCase()
    const correctAnswer = (current?.word || '').trim().toLowerCase()
    const correct = normalizedAnswer === correctAnswer
    setIsCorrect(correct)
    setShowResult(true)

    if (currentStepKey === 'listen') {
      setStepResults((prev) => ({ ...prev, listen: correct }))
    }
    if (currentStepKey === 'meaning') {
      setStepResults((prev) => ({ ...prev, meaning: correct }))
    }
  }

  const handleContinue = async () => {
    if (currentStepKey === 'view') {
      if (!hasFlippedOnce) return
      // Bước 1: chỉ chuyển sang bước 2, không lưu tiến độ
      setCompletedSteps((prev) => prev + 1)
      setStep(1)
      resetForNextStep()
      return
    }
    if (!showResult) return

    if (currentStepKey === 'listen') {
      // Bước 2: nếu sai → đưa về cuối ngay, không học bước 3
      if (!isCorrect) {
        setCompletedSteps((prev) => prev + 1)
        if (current?.id) {
          const prev = attemptsRef.current.get(current.id) || 1
          if (prev < MAX_ATTEMPTS_PER_WORD) {
            attemptsRef.current.set(current.id, prev + 1)
            setQueue((q) => [...q, current])
          }
        }
        // Chuyển sang từ tiếp theo, reset về bước 0
        const nextIndex = index + 1
        if (nextIndex < total) {
          setIndex(nextIndex)
        } else if (nextIndex < total + 1) {
          // Edge case: nếu vừa append
          setIndex(nextIndex)
        } else {
          setIndex(nextIndex)
        }
        setStep(0)
        setIsFlipped(false)
        setHasFlippedOnce(false)
        setUserAnswer('')
        setShowResult(false)
        setIsCorrect(false)
        setStepResults({ listen: null, meaning: null })
        return
      }
      // Bước 2 đúng → chuyển sang bước 3
      setCompletedSteps((prev) => prev + 1)
      setStep(2)
      resetForNextStep()
      return
    }

    // meaning step -> finish word
    // Bước 3: nếu sai → đưa về cuối
    if (!isCorrect) {
      setCompletedSteps((prev) => prev + 1)
      if (current?.id) {
        const prev = attemptsRef.current.get(current.id) || 1
        if (prev < MAX_ATTEMPTS_PER_WORD) {
          attemptsRef.current.set(current.id, prev + 1)
          setQueue((q) => [...q, current])
        }
      }
      // Chuyển sang từ tiếp theo, reset về bước 0
      const nextIndex = index + 1
      if (nextIndex < total) {
        setIndex(nextIndex)
      } else if (nextIndex < total + 1) {
        // Edge case: nếu vừa append
        setIndex(nextIndex)
      } else {
        setIndex(nextIndex)
      }
      setStep(0)
      setIsFlipped(false)
      setHasFlippedOnce(false)
      setUserAnswer('')
      setShowResult(false)
      setIsCorrect(false)
      setStepResults({ listen: null, meaning: null })
      return
    }

    // Bước 3 đúng → đánh dấu hoàn thành cả 3 bước
    if (current?.id) {
      setCompletedSteps((prev) => prev + 1)
      setCompletedWords((prev) => new Set([...prev, current.id]))
      try {
        await submitSpacedRepetition(current.id, 2) // Quality: Easy
      } catch (err) {
        console.error('Error submit spaced repetition:', err)
      }
    }

    // Chuyển sang từ tiếp theo
    const nextIndex = index + 1
    if (nextIndex < total) {
      setIndex(nextIndex)
    } else if (nextIndex < total + 1) {
      // Edge case: nếu vừa append
      setIndex(nextIndex)
    } else {
      // Completed
      setIndex(nextIndex)
    }

    setStep(0)
    setIsFlipped(false)
    setHasFlippedOnce(false)
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setStepResults({ listen: null, meaning: null })
  }

  // Progress: tính dựa trên số bước đã hoàn thành / (3 * tổng số từ ban đầu)
  const totalPlannedSteps = originalTotal * 3
  const progress =
    totalPlannedSteps > 0 ? Math.min(100, Math.round((completedSteps / totalPlannedSteps) * 100)) : 0

  // Khi hoàn thành toàn bộ từ trong topic -> gọi complete-topic 1 lần
  useEffect(() => {
    if (!topicId) return
    if (completedTopicRef.current) return
    if (originalTotal <= 0) return
    if (completedWords.size !== originalTotal) return

    completedTopicRef.current = true
    ;(async () => {
      try {
        await completeTopic(topicId)
        setIsTopicCompleted(true)
      } catch (err) {
        // nếu fail thì cho phép retry bằng cách mở lại flag
        completedTopicRef.current = false
        console.error('Error completeTopic:', err)
      }
    })()
  }, [completedWords.size, originalTotal, topicId])

  const handleFlipChange = (nextFlipped) => {
    setIsFlipped(nextFlipped)
    if (nextFlipped) {
      setHasFlippedOnce(true)
    }
  }

  return {
    flashcards: queue,
    current,
    currentIndex: index,
    total: originalTotal, // Hiển thị tổng số từ ban đầu
    step,
    currentStepKey,
    isFlipped,
    loading,
    error,
    userAnswer,
    showResult,
    isCorrect,
    stepResults,
    setUserAnswer,
    hasFlippedOnce,
    handleFlip: handleFlipChange,
    handleSubmit,
    handleContinue,
    fetchFlashcards,
    playAudio,
    progress,
    isTopicCompleted,
  }
}


