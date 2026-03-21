import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

import { useKoreanWordleIME } from './useKoreanWordleIME'
import TapSound from '../../../../../../assets/sound-effect/solitare/tap.wav'
import FailSound from '../../../../../../assets/sound-effect/solitare/fail.wav'
import SuccessSound from '../../../../../../assets/sound-effect/solitare/success.wav'
import { submitWordleGuess, getWordleResult } from '../../../api/wordle-level-api'
import { hasSeenHowToPlayTour } from './components/HowToPlayTour'

export function useWordlePlayControl({
  level: _level = 1,
  dailyWordleId,
  initialWordLength,
  initialAttemptCount = 0,
  maxAttempts,
}) {
  const router = useRouter()
  const isWeb = Platform.OS === 'web'

  const WORD_LENGTH = initialWordLength || 2
  const usedAttempts = initialAttemptCount || 0
  const configuredMaxAttempts =
    typeof maxAttempts === 'number' && maxAttempts > 0 ? maxAttempts : 6
  const MAX_GUESSES = Math.max(0, configuredMaxAttempts - usedAttempts)
  const TOPIC_NAME = ''

  const [rows, setRows] = useState([])
  const [gameState, setGameState] = useState('playing') // playing | won | lost
  const [targetWord, setTargetWord] = useState('')
  const [showMenuPopup, setShowMenuPopup] = useState(false)
  const [wordResult, setWordResult] = useState(null)
  const [tourRun, setTourRun] = useState(false)

  const tapSoundRef = useRef(null)
  const failSoundRef = useRef(null)
  const successSoundRef = useRef(null)
  const isSubmittingRef = useRef(false)

  const {
    gridCells,
    activeColIndex,
    activeColIndexRef,
    focusCell,
    handlePhysicalKeyDown,
    handleVirtualKey,
    handleIMEText,
    resetRow,
  } = useKoreanWordleIME({
    wordLength: WORD_LENGTH,
    onSubmitRow: (word) => {
      submitRow(word)
    },
  })

  // ===== Hidden IME input refs (web only) =====
  const hiddenImeInputRef = useRef(null)
  const composingRef = useRef(false)
  const compositionStartColRef = useRef(0)
  const lastComposingTextRef = useRef('')

  const focusHiddenImeInput = useCallback(() => {
    if (!isWeb) return
    const input = hiddenImeInputRef.current
    if (!input) return
    try {
      input.focus()
    } catch (e) {}
  }, [isWeb])

  const clearHiddenImeInput = useCallback(() => {
    const input = hiddenImeInputRef.current
    if (!input) return
    input.value = ''
  }, [])

  const handleHiddenInputCompositionStart = useCallback(() => {
    composingRef.current = true
    compositionStartColRef.current = activeColIndexRef?.current ?? activeColIndex
    lastComposingTextRef.current = ''
  }, [activeColIndex, activeColIndexRef])

  const handleHiddenInputCompositionUpdate = useCallback(
    (e) => {
      if (gameState !== 'playing') return
      const input = hiddenImeInputRef.current
      const composingText = e?.data || input?.value || ''
      if (!composingText) return

      lastComposingTextRef.current = composingText
      handleIMEText(composingText, {
        phase: 'update',
        startCol: compositionStartColRef.current,
      })
    },
    [gameState, handleIMEText]
  )

  const handleHiddenInputCompositionEnd = useCallback(
    (e) => {
      composingRef.current = false
      const input = hiddenImeInputRef.current
      const committedText = e?.data || lastComposingTextRef.current || input?.value || ''

      if (gameState === 'playing' && committedText) {
        handleIMEText(committedText, {
          phase: 'end',
          startCol: compositionStartColRef.current,
        })
      }

      lastComposingTextRef.current = ''
      if (input) input.value = ''
    },
    [gameState, handleIMEText]
  )

  useEffect(() => {
    if (!isWeb) return
    if (gameState !== 'playing') return
  
    const handleWindowKeyDown = (e) => {
      const target = e.target
      const tagName = target?.tagName?.toLowerCase()
  
      // nếu đang focus hidden IME input thì để hidden input tự xử lý
      if (target === hiddenImeInputRef.current) return
  
      // input/textarea thật khác thì bỏ qua
      if (tagName === 'input' || tagName === 'textarea') return
      if (target?.isContentEditable) return
  
      handlePhysicalKeyDown(e)
    }
  
    window.addEventListener('keydown', handleWindowKeyDown)
  
    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown)
    }
  }, [isWeb, gameState, handlePhysicalKeyDown])

  const handleHiddenInputBeforeInput = useCallback(
    (e) => {
      if (gameState !== 'playing') return

      const nativeEvt = e.nativeEvent || e
      const inputType = nativeEvt?.inputType
      const data = nativeEvt?.data || ''

      if (inputType === 'insertFromPaste') {
        e.preventDefault?.()
        return
      }

      if (inputType === 'insertText' && !nativeEvt?.isComposing) {
        e.preventDefault?.()
        if (data) {
          handleIMEText(data, {
            phase: 'end',
            startCol: activeColIndexRef?.current ?? activeColIndex,
          })
        }
        return
      }

      if (inputType === 'deleteContentBackward') {
        e.preventDefault?.()
        handleVirtualKey('BACKSPACE')
      }
    },
    [activeColIndex, activeColIndexRef, gameState, handleIMEText, handleVirtualKey]
  )

  const handleHiddenInputInput = useCallback(
    (e) => {
      const input = hiddenImeInputRef.current
      const value = e?.target?.value || input?.value || ''
      if (gameState !== 'playing' || !value) return

      if (composingRef.current) return

      handleIMEText(value, {
        phase: 'end',
        startCol: activeColIndexRef?.current ?? activeColIndex,
      })

      if (input) input.value = ''
    },
    [activeColIndex, activeColIndexRef, gameState, handleIMEText]
  )

  const handleHiddenInputBlur = useCallback(() => {
    if (gameState !== 'playing') return
    requestAnimationFrame?.(() => {
      focusHiddenImeInput()
    })
  }, [focusHiddenImeInput, gameState])

  const handleHiddenInputKeyDown = useCallback(
    (e) => {
      if (gameState !== 'playing') return
      if (composingRef.current || e?.isComposing) return
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e?.key

      if (
        key === 'Backspace' ||
        key === 'Enter' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === ' ' ||
        (typeof key === 'string' && key.length === 1)
      ) {
        e.preventDefault?.()
      }

      handlePhysicalKeyDown(e)
      clearHiddenImeInput()
    },
    [gameState, handlePhysicalKeyDown, clearHiddenImeInput]
  )

  const handleHiddenInputPaste = useCallback((e) => {
    e.preventDefault?.()
    e.stopPropagation?.()
    return false
  }, [])

  const handleCellClick = useCallback(
    (index) => {
      focusCell(index)
      focusHiddenImeInput()
    },
    [focusCell, focusHiddenImeInput]
  )

  // focus hidden input mỗi khi đang chơi
  useEffect(() => {
    if (!isWeb) return
    if (gameState !== 'playing') return
    focusHiddenImeInput()
    clearHiddenImeInput()
  }, [isWeb, gameState, focusHiddenImeInput, clearHiddenImeInput])

  // init sound
  useEffect(() => {
    if (!isWeb || typeof Audio === 'undefined') return

    if (!tapSoundRef.current) {
      tapSoundRef.current = new Audio(TapSound)
      tapSoundRef.current.volume = 0.7
    }

    if (!failSoundRef.current) {
      failSoundRef.current = new Audio(FailSound)
      failSoundRef.current.volume = 0.7
    }

    if (!successSoundRef.current) {
      successSoundRef.current = new Audio(SuccessSound)
      successSoundRef.current.volume = 0.8
    }
  }, [isWeb])

  const playTapSound = useCallback(() => {
    if (!isWeb || !tapSoundRef.current) return
    try {
      tapSoundRef.current.currentTime = 0
      tapSoundRef.current.play().catch(() => {})
    } catch (e) {}
  }, [isWeb])

  const submitRow = useCallback(
    async (guessWord) => {
      if (isSubmittingRef.current) return
      if (gameState !== 'playing') return
      if (rows.length >= MAX_GUESSES) return
      if (!guessWord || guessWord.length !== WORD_LENGTH) return

      isSubmittingRef.current = true

      try {
        const normalizedGuess = guessWord.replace(/\s/g, '')
        const data = await submitWordleGuess(dailyWordleId, normalizedGuess)
        const { isWon, isGameOver, feedbacks } = data || {}

        if (Array.isArray(feedbacks)) {
          setRows((prev) => [...prev, feedbacks])

          const hasGrayOrYellow = feedbacks.some(
            (fb) => fb.blockColor === 'Gray' || fb.blockColor === 'Yellow'
          )
          const allGreen = feedbacks.every((fb) => fb.blockColor === 'Green')

          if (allGreen) {
            if (successSoundRef.current) {
              try {
                successSoundRef.current.currentTime = 0
                successSoundRef.current.play().catch(() => {})
              } catch (e) {}
            }

            const guessedWord = feedbacks.map((fb) => fb.character || '').join('')
            setTargetWord(guessedWord)
            setGameState('won')

            try {
              const result = await getWordleResult(dailyWordleId)
              setWordResult(result || null)
            } catch (error) {
              console.error('[useWordlePlayControl] Error fetching wordle result:', error)
            }
          } else if (hasGrayOrYellow && failSoundRef.current) {
            try {
              failSoundRef.current.currentTime = 0
              failSoundRef.current.play().catch(() => {})
            } catch (e) {}
          }

          if (isWon && !allGreen) {
            const guessedWord = feedbacks.map((fb) => fb.character || '').join('')
            setTargetWord(guessedWord)
            setGameState('won')
          } else if (isGameOver) {
            setGameState('lost')
          }
        }

        resetRow()
      } catch (error) {
        console.error('[useWordlePlayControl] submit guess error:', error)
      } finally {
        isSubmittingRef.current = false
      }
    },
    [MAX_GUESSES, WORD_LENGTH, dailyWordleId, gameState, resetRow, rows.length]
  )

  const handleMenuClick = useCallback(() => {
    setShowMenuPopup(true)
  }, [])

  const handleContinue = useCallback(() => {
    setShowMenuPopup(false)
  }, [])

  const handleQuit = useCallback(() => {
    setShowMenuPopup(false)
    router.back()
  }, [router])

  const handleHowToPlay = useCallback(() => {
    setShowMenuPopup(false)
    requestAnimationFrame?.(() => {
      setTourRun(true)
    })
  }, [])

  const handlePlayWordAudio = useCallback(() => {
    if (!isWeb) return
    const url = wordResult?.audioUrl
    if (!url || typeof Audio === 'undefined') return

    try {
      const audio = new Audio(url)
      audio.play().catch((err) => console.log('[useWordlePlayControl] play word audio error:', err))
    } catch (e) {
      console.error('[useWordlePlayControl] Failed to create audio element:', e)
    }
  }, [isWeb, wordResult])

  const handleRestart = useCallback(() => {
    setRows([])
    setGameState('playing')
    resetRow()
    setTargetWord('')
    setWordResult(null)
    if (isWeb) {
      focusHiddenImeInput()
      clearHiddenImeInput()
    }
  }, [resetRow, isWeb, focusHiddenImeInput, clearHiddenImeInput])

  const handleNavigateToBoard = useCallback(() => {
    router.push(`/minigame/wordle/wordle-board?dailyWordleId=${dailyWordleId}`)
  }, [dailyWordleId, router])

  useEffect(() => {
    if (!isWeb) return
    try {
      if (hasSeenHowToPlayTour()) return
      requestAnimationFrame?.(() => {
        setTourRun(true)
      })
    } catch (e) {}
  }, [isWeb])

  const hiddenImeInputProps = useMemo(() => {
    if (!isWeb) return null

    return {
      ref: hiddenImeInputRef,
      autoCorrect: 'off',
      autoCapitalize: 'none',
      spellCheck: false,
      tabIndex: -1,
      onKeyDown: handleHiddenInputKeyDown,
      onPaste: handleHiddenInputPaste,
      onCompositionStart: handleHiddenInputCompositionStart,
      onCompositionUpdate: handleHiddenInputCompositionUpdate,
      onCompositionEnd: handleHiddenInputCompositionEnd,
      onBeforeInput: handleHiddenInputBeforeInput,
      onInput: handleHiddenInputInput,
      onBlur: handleHiddenInputBlur,
    }
  }, [
    isWeb,
    handleHiddenInputKeyDown,
    handleHiddenInputPaste,
    handleHiddenInputCompositionStart,
    handleHiddenInputCompositionUpdate,
    handleHiddenInputCompositionEnd,
    handleHiddenInputBeforeInput,
    handleHiddenInputInput,
    handleHiddenInputBlur,
  ])

  return {
    // config
    isWeb,
    WORD_LENGTH,
    MAX_GUESSES,
    TOPIC_NAME,

    // state
    rows,
    gameState,
    targetWord,
    showMenuPopup,
    wordResult,
    tourRun,
    gridCells,
    activeColIndex,

    // refs/props
    hiddenImeInputProps,

    // setters
    setTourRun,
    setRows,
    setGameState,
    setTargetWord,
    setWordResult,
    setShowMenuPopup,

    // ime/game handlers
    handleVirtualKey: (key) => {
      playTapSound()
      handleVirtualKey(key)
    },
    handleCellClick,
    submitRow,
    resetRow,

    // menu / actions
    handleMenuClick,
    handleContinue,
    handleQuit,
    handleHowToPlay,
    handleRestart,
    handleNavigateToBoard,
    handlePlayWordAudio,

    // utilities
    focusHiddenImeInput,
    clearHiddenImeInput,
  }
}

export default useWordlePlayControl