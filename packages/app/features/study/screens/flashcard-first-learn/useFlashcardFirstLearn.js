import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { completeTopic, getFlashcardsForStudy, submitSpacedRepetitionWithCorrect } from '@tokki/app/features/study/api'

// Import expo-av cho mobile (nếu có)
let ExpoAudio = null
let ExpoAudioMode = null
if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av')
    ExpoAudio = expoAv.Audio
    ExpoAudioMode = expoAv.Audio
    // Set audio mode để đảm bảo sound có thể phát
    if (ExpoAudioMode && ExpoAudioMode.setAudioModeAsync) {
      ExpoAudioMode.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      }).catch((e) => {
        console.warn('Failed to set audio mode:', e)
      })
    }
  } catch (e) {
    // expo-av chưa được cài đặt
    console.warn('expo-av not available, audio playback may not work on mobile', e)
  }
}

const STEPS = ['view', 'listen', 'meaning'] // 0,1,2
const MAX_ATTEMPTS_PER_WORD = 2 // 1 lần học + 1 lần học lại ở cuối
const BATCH_SIZE = 5 // Số từ vựng học mỗi lần

export function useFlashcardFirstLearn(topicId) {
  // Queue học: danh sách gốc + các từ cần học lại được append xuống cuối
  const [queue, setQueue] = useState([])
  const [originalTotal, setOriginalTotal] = useState(0) // Tổng số từ ban đầu trong batch hiện tại
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
  const [showContinueDialog, setShowContinueDialog] = useState(false) // Dialog hỏi tiếp tục học
  const [hasMoreFlashcards, setHasMoreFlashcards] = useState(true) // Còn từ vựng để học không
  const [allWordsCompleted, setAllWordsCompleted] = useState(false) // Đã học hết tất cả từ vựng
  const [completedInBatch, setCompletedInBatch] = useState(0) // Số từ đã hoàn thành trong batch hiện tại (state để trigger re-render)
  const [nextBatch, setNextBatch] = useState(null) // Batch tiếp theo đã prefetch (Array | null)
  const [isCheckingNextBatch, setIsCheckingNextBatch] = useState(false) // Đang kiểm tra batch tiếp theo

  const audioRef = useRef(null)
  const soundRef = useRef(null)

  // Track số lần 1 từ đã xuất hiện trong queue (để tránh loop vô hạn)
  const attemptsRef = useRef(new Map()) // key: vocabularyId, value: number
  const completedTopicRef = useRef(false)
  const completedInBatchRef = useRef(0) // Số từ đã hoàn thành đúng (meaning step) trong batch hiện tại
  const batchWordIdsRef = useRef(new Set()) // Set các vocabularyId trong batch hiện tại
  const prefetchInFlightRef = useRef(false)

  const current = queue[index] || null
  const total = queue.length

  const currentStepKey = useMemo(() => STEPS[step] || 'view', [step])

  const cleanupAudio = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch (e) {
          // ignore
        }
        audioRef.current = null
      }
    } else {
      // Mobile: cleanup expo-av sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync()
        } catch (e) {
          // ignore
        }
        soundRef.current = null
      }
    }
  }, [])

  const playAudio = useCallback(async () => {
    if (!current?.audioUrl) {
      console.warn('[Audio] No audioUrl for current word')
      return
    }
    
    console.log('[Audio] Attempting to play:', current.audioUrl)
    
    if (Platform.OS === 'web') {
      // Web: sử dụng HTML5 Audio
      await cleanupAudio()
      const audio = typeof window !== 'undefined' && window.Audio ? new window.Audio(current.audioUrl) : null
      if (!audio) {
        console.error('[Audio] Audio API not available')
        return
      }
      audioRef.current = audio
      audio.volume = 1.0
      audio.play().catch((err) => {
        console.error('[Audio] Error playing audio on web:', err)
      })
      audio.addEventListener('ended', () => {
        console.log('[Audio] Audio finished playing')
        audioRef.current = null
      })
      console.log('[Audio] Audio started playing on web')
    } else {
      // Mobile: sử dụng expo-av
      if (!ExpoAudio) {
        console.error('[Audio] expo-av not available, cannot play audio on mobile')
        return
      }
      try {
        await cleanupAudio()
        console.log('[Audio] Creating sound with URI:', current.audioUrl)
        const { sound } = await ExpoAudio.Sound.createAsync(
          { uri: current.audioUrl },
          { 
            shouldPlay: true,
            volume: 1.0,
            isMuted: false,
          }
        )
        soundRef.current = sound
        console.log('[Audio] Sound created, setting up status listener')
        
        // Kiểm tra status ngay sau khi tạo
        const initialStatus = await sound.getStatusAsync()
        console.log('[Audio] Initial status:', {
          isLoaded: initialStatus.isLoaded,
          isPlaying: initialStatus.isPlaying,
          error: initialStatus.error,
          durationMillis: initialStatus.durationMillis,
        })
        
        if (initialStatus.error) {
          console.error('[Audio] Error in initial status:', initialStatus.error)
          await sound.unloadAsync()
          soundRef.current = null
          return
        }
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              console.log('[Audio] Audio finished playing')
              soundRef.current = null
            } else if (status.error) {
              console.error('[Audio] Playback error:', status.error)
            } else if (status.isPlaying) {
              console.log('[Audio] Audio is playing')
            }
          } else if (status.error) {
            console.error('[Audio] Sound load error:', status.error)
          }
        })
        
        // Đảm bảo sound được play
        setTimeout(async () => {
          try {
            const status = await sound.getStatusAsync()
            console.log('[Audio] Status after delay:', {
              isLoaded: status.isLoaded,
              isPlaying: status.isPlaying,
              error: status.error,
            })
            if (status.isLoaded && !status.isPlaying && !status.error) {
              console.log('[Audio] Audio not playing, attempting to play...')
              await sound.playAsync()
            }
          } catch (playErr) {
            console.error('[Audio] Error ensuring audio plays:', playErr)
          }
        }, 100)
        
        console.log('[Audio] Audio started playing on mobile')
      } catch (err) {
        console.error('[Audio] Error playing audio on mobile:', err)
      }
    }
  }, [cleanupAudio, current])

  const fetchFlashcards = useCallback(async (isInitial = true) => {
    if (!topicId) {
      setError('Thiếu thông tin chủ đề')
      setQueue([])
      setLoading(false)
      return
    }
    try {
      if (isInitial) {
        setLoading(true)
      }
      setError(null)
      const data = await getFlashcardsForStudy(topicId, BATCH_SIZE)
      const base = Array.isArray(data) ? data : []
      
      // Nếu không có từ vựng nào trả về, có nghĩa là đã học hết
      if (base.length === 0) {
        setHasMoreFlashcards(false)
        setAllWordsCompleted(true)
        setNextBatch(null)
        if (isInitial) {
          setQueue([])
          setOriginalTotal(0)
        }
      } else {
        setHasMoreFlashcards(true)
        setAllWordsCompleted(false)
        setNextBatch(null)
        if (isInitial) {
          setQueue(base)
          setOriginalTotal(base.length)
          setCompletedWords(new Set())
          setCompletedSteps(0)
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
          completedInBatchRef.current = 0
          setCompletedInBatch(0)
          batchWordIdsRef.current = new Set(base.map((item) => item.id))
        } else {
          // Fetch batch mới để tiếp tục học
          setQueue(base)
          setOriginalTotal(base.length)
          setIndex(0)
          setStep(0)
          setIsFlipped(false)
          setHasFlippedOnce(false)
          setUserAnswer('')
          setShowResult(false)
          setIsCorrect(false)
          setStepResults({ listen: null, meaning: null })
          completedInBatchRef.current = 0
          setCompletedInBatch(0)
          batchWordIdsRef.current = new Set(base.map((item) => item.id))
        }
      }
      setIsTopicCompleted(false)
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setQueue([])
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }, [topicId])

  const resetForNewBatch = useCallback((base) => {
    setQueue(base)
    setOriginalTotal(base.length)
    setCompletedSteps(0)
    setIndex(0)
    setStep(0)
    setIsFlipped(false)
    setHasFlippedOnce(false)
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setStepResults({ listen: null, meaning: null })
    completedInBatchRef.current = 0
    setCompletedInBatch(0)
    batchWordIdsRef.current = new Set(base.map((item) => item.id))
  }, [])

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
      
      // Chỉ đếm nếu từ này thuộc batch hiện tại (không phải từ bị đưa lại vào queue)
      if (batchWordIdsRef.current.has(current.id)) {
        completedInBatchRef.current += 1
        setCompletedInBatch(completedInBatchRef.current)
      }
      
      // Gửi API với isCorrect: true khi hoàn thành đủ 3 bước đúng
      try {
        await submitSpacedRepetitionWithCorrect(current.id, true)
      } catch (err) {
        console.error('Error submit spaced repetition:', err)
      }
    }

    // Chuyển sang từ tiếp theo
    const nextIndex = index + 1
    
    // Kiểm tra xem đã hoàn thành đủ số từ trong batch hiện tại chưa
    // (thường là 5 từ, nhưng có thể ít hơn nếu API trả về ít hơn)
    const batchSize = batchWordIdsRef.current.size
    const hasCompletedCurrentBatch = completedInBatchRef.current >= batchSize
    
    if (hasCompletedCurrentBatch) {
      // Đã học xong batch hiện tại -> prefetch batch tiếp theo trước khi hỏi người dùng
      if (!prefetchInFlightRef.current) {
        prefetchInFlightRef.current = true
        setIsCheckingNextBatch(true)
        try {
          const data = await getFlashcardsForStudy(topicId, BATCH_SIZE)
          const next = Array.isArray(data) ? data : []
          if (next.length === 0) {
            setHasMoreFlashcards(false)
            setAllWordsCompleted(true)
            setNextBatch(null)
            setShowContinueDialog(false)
          } else {
            setHasMoreFlashcards(true)
            setAllWordsCompleted(false)
            setNextBatch(next)
            setShowContinueDialog(true)
          }
        } catch (err) {
          console.error('Error prefetch next batch:', err)
          setError(err.message || 'Không thể tải danh sách từ vựng tiếp theo')
          // vẫn cho user chọn dừng
          setHasMoreFlashcards(false)
          setNextBatch(null)
          setShowContinueDialog(true)
        } finally {
          setIsCheckingNextBatch(false)
          prefetchInFlightRef.current = false
        }
      }
      return
    }

    if (nextIndex < total) {
      setIndex(nextIndex)
    } else {
      // Đã học hết batch, nhưng chưa đủ 5 từ hoàn thành
      // (có thể do có từ bị đưa về cuối queue)
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

  // Hàm xử lý khi người dùng chọn tiếp tục học
  const handleContinueLearning = useCallback(async () => {
    setShowContinueDialog(false)
    // Nếu đã prefetch sẵn batch mới -> reset màn ngay
    if (Array.isArray(nextBatch) && nextBatch.length > 0) {
      resetForNewBatch(nextBatch)
      setNextBatch(null)
      return
    }
    // Fallback: nếu chưa có prefetch (hoặc lỗi) thì fetch lại
    setLoading(true)
    try {
      await fetchFlashcards(false) // Fetch batch mới
    } catch (err) {
      console.error('Error fetching next batch:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng tiếp theo')
    } finally {
      setLoading(false)
    }
  }, [fetchFlashcards, nextBatch, resetForNewBatch])

  // Hàm xử lý khi người dùng chọn dừng học
  const handleStopLearning = useCallback(() => {
    setShowContinueDialog(false)
    setNextBatch(null)
    setAllWordsCompleted(true)
  }, [])

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
    total: originalTotal, // Hiển thị tổng số từ ban đầu trong batch
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
    showContinueDialog,
    hasMoreFlashcards,
    allWordsCompleted,
    handleContinueLearning,
    handleStopLearning,
    completedInBatch, // Số từ đã hoàn thành trong batch hiện tại
    batchSize: batchWordIdsRef.current.size, // Kích thước batch hiện tại
    isCheckingNextBatch,
  }
}


