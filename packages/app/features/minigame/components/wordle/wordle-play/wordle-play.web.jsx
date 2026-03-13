import { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { VolumeControl } from './components/VolumeControl'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { HowToPlayTour, hasSeenHowToPlayTour } from './components/HowToPlayTour'
import { useKoreanWordleIME } from './useKoreanWordleIME'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import TapSound from '../../../../../../assets/sound-effect/solitare/tap.wav'
import FailSound from '../../../../../../assets/sound-effect/solitare/fail.wav'
import SuccessSound from '../../../../../../assets/sound-effect/solitare/success.wav'
import { submitWordleGuess, getWordleResult } from '../../../api/wordle-level-api'

export function WordlePlayWeb({
  level: _level = 1,
  dailyWordleId,
  initialWordLength,
  initialAttemptCount = 0,
  maxAttempts,
}) {
  const router = useRouter()
  const WORD_LENGTH = initialWordLength || 2
  const usedAttempts = initialAttemptCount || 0
  const configuredMaxAttempts =
    typeof maxAttempts === 'number' && maxAttempts > 0 ? maxAttempts : 6
  const MAX_GUESSES = Math.max(0, configuredMaxAttempts - usedAttempts)
  const TOPIC_NAME = '' 
  const [rows, setRows] = useState([]) // mỗi row = mảng feedbacks từ API
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  const [targetWord, setTargetWord] = useState('') // Từ đã đoán đúng
  const [showMenuPopup, setShowMenuPopup] = useState(false)
  const [wordResult, setWordResult] = useState(null) // dữ liệu từ API result (định nghĩa, ảnh, audio)

  // How-to-play tour (react-joyride)
  const [tourRun, setTourRun] = useState(false)
  
  // Audio refs (sound effects)
  const tapSoundRef = useRef(null)
  const failSoundRef = useRef(null)
  const successSoundRef = useRef(null)
  const isSubmittingRef = useRef(false)

  // Korean IME cho active row
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

  const hiddenImeInputRef = useRef(null)
  const composingRef = useRef(false)
  const compositionStartColRef = useRef(0)
  const lastComposingTextRef = useRef('')

  const focusHiddenImeInput = useCallback(() => {
    if (Platform.OS !== 'web') return
    const input = hiddenImeInputRef.current
    if (!input) return
    try {
      input.focus()
    } catch (e) {
      // ignore
    }
  }, [])

  const clearHiddenImeInput = useCallback(() => {
    const input = hiddenImeInputRef.current
    if (!input) return
    input.value = ''
  }, [])

  const handleHiddenInputCompositionStart = useCallback(() => {
    composingRef.current = true
    // Dùng ref để tránh stale state khi IME events đến nhanh (vd gõ "가" rồi "나" bị đè ô 1)
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
      // Phase update: preview theo startCol của phiên composition (để IME có thể đổi "관" -> "과나")
      handleIMEText(composingText, { phase: 'update', startCol: compositionStartColRef.current })
    },
    [gameState, handleIMEText]
  )

  const handleHiddenInputCompositionEnd = useCallback(
    (e) => {
      composingRef.current = false
      const input = hiddenImeInputRef.current
      // Một số browser/IME không set e.data ở compositionend, nên fallback sang ref/value
      const committedText = e?.data || lastComposingTextRef.current || input?.value || ''
      if (gameState === 'playing' && committedText) {
        // Phase end: commit hoàn toàn, được phép move cột nếu cần
        handleIMEText(committedText, { phase: 'end', startCol: compositionStartColRef.current })
      }
      lastComposingTextRef.current = ''
      if (input) {
        input.value = ''
      }
    },
    [gameState, handleIMEText]
  )

  const handleHiddenInputBeforeInput = useCallback(
    (e) => {
      if (gameState !== 'playing') return
      const nativeEvt = e.nativeEvent || e
      const inputType = nativeEvt?.inputType
      const data = nativeEvt?.data || ''
  
      // 1) chặn paste
      if (inputType === 'insertFromPaste') {
        e.preventDefault?.()
        return
      }
  
      // 2) gõ ký tự thường (không phải composition)
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
  
      // 3) backspace
      if (inputType === 'deleteContentBackward') {
        e.preventDefault?.()
        handleVirtualKey('BACKSPACE')
        return
      }
    },
    [activeColIndex, activeColIndexRef, gameState, handleIMEText, handleVirtualKey]
  )

  const handleHiddenInputInput = useCallback(
    (e) => {
      const input = hiddenImeInputRef.current
      const value = e?.target?.value || input?.value || ''
      if (gameState !== 'playing' || !value) return

      // Nếu đang composing, để IME xử lý qua compositionupdate/end
      if (composingRef.current) {
        // IMPORTANT: Không clear input.value trong lúc composing (Microsoft IME có thể bị mất state)
        return
      }

      // Không có composition → text đã finalized
      handleIMEText(value, {
        phase: 'end',
        startCol: activeColIndexRef?.current ?? activeColIndex,
      })
      if (input) {
        input.value = ''
      }
    },
    [activeColIndex, activeColIndexRef, gameState, handleIMEText]
  )

  const handleHiddenInputBlur = useCallback(() => {
    // Chỉ giữ focus-trap khi đang chơi; sau khi thắng/thua thì cho phép focus vào InputBar
    if (gameState !== 'playing') return
    requestAnimationFrame(() => {
      focusHiddenImeInput()
    })
  }, [focusHiddenImeInput, gameState])

  const handleHiddenInputKeyDown = useCallback(
    (e) => {
      if (gameState !== 'playing') return

      // đang IME composing thì để composition events xử lý
      if (composingRef.current || e?.isComposing) return

      // không chặn Ctrl/Meta/Alt để tránh phá shortcut trình duyệt
      if (e.ctrlKey || e.metaKey || e.altKey) return

      const key = e?.key

      // Ngăn browser nhập trực tiếp vào input (đặc biệt với phím printable)
      // rồi route qua cùng logic như virtual keyboard / IME
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

      // đảm bảo hidden input luôn rỗng, tránh browser giữ text
      clearHiddenImeInput()
    },
    [gameState, handlePhysicalKeyDown, clearHiddenImeInput]
  )

  const handleHiddenInputPaste = useCallback((e) => {
    // chặn paste (nhưng không đụng tới các shortcut khác)
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

  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (gameState !== 'playing') return
    focusHiddenImeInput()
    clearHiddenImeInput()
  }, [gameState, focusHiddenImeInput, clearHiddenImeInput])

  // Initialize sound effects
  useEffect(() => {
    // Tap sound
    if (!tapSoundRef.current) {
      tapSoundRef.current = new Audio(TapSound)
      tapSoundRef.current.volume = 0.7
    }

    // Fail sound
    if (!failSoundRef.current) {
      failSoundRef.current = new Audio(FailSound)
      failSoundRef.current.volume = 0.7
    }

    // Success sound
    if (!successSoundRef.current) {
      successSoundRef.current = new Audio(SuccessSound)
      successSoundRef.current.volume = 0.8
    }

    return () => {}
  }, [])

  // NOTE: Không bắt keydown/paste ở window để tránh phá hành vi browser.
  // Thay vào đó: bắt ngay trên hidden IME input (focus-trap) để mọi input đi qua cùng logic.

  const submitRow = async (guessWord) => {
    if (isSubmittingRef.current) return
    if (gameState !== 'playing') return
    if (rows.length >= MAX_GUESSES) return
    if (!guessWord || guessWord.length !== WORD_LENGTH) return
    if (!dailyWordleId) {
      isSubmittingRef.current = true
    }

    try {
      // guessWord là chuỗi không có khoảng cách giữa các chữ
      const normalizedGuess = guessWord.replace(/\s/g, '')
      const data = await submitWordleGuess(dailyWordleId, normalizedGuess)
      const { isWon, isGameOver, feedbacks } = data || {}

      if (Array.isArray(feedbacks)) {
        setRows(prev => [...prev, feedbacks])
        
        // Kiểm tra màu sắc để phát sound phù hợp
        const hasGrayOrYellow = feedbacks.some(fb => 
          fb.blockColor === 'Gray' || fb.blockColor === 'Yellow'
        )
        const allGreen = feedbacks.every(fb => fb.blockColor === 'Green')
        
        if (allGreen) {
          // Tất cả đều màu green - phát success sound và hiển thị từ
          if (successSoundRef.current) {
            successSoundRef.current.currentTime = 0
            successSoundRef.current.play().catch(err => console.log('Success sound play error:', err))
          }
          
          // Hiển thị từ đã đoán đúng
          const guessedWord = feedbacks.map(fb => fb.character || '').join('')
          setTargetWord(guessedWord)
          setGameState('won')
          
          // Gọi API để lấy kết quả (định nghĩa, ảnh, audio...)
          try {
            const result = await getWordleResult(dailyWordleId)
            console.log('[WordlePlayWeb] Wordle result:', result)
            setWordResult(result || null)
          } catch (error) {
            console.error('[WordlePlayWeb] Error fetching wordle result:', error)
          }
        } else if (hasGrayOrYellow && failSoundRef.current) {
          // Có màu gray hoặc yellow - phát fail sound
          failSoundRef.current.currentTime = 0
          failSoundRef.current.play().catch(err => console.log('Fail sound play error:', err))
        }
        
        // Kiểm tra game state từ API
        if (isWon && !allGreen) {
          const guessedWord = feedbacks.map(fb => fb.character || '').join('')
          setTargetWord(guessedWord)
          setGameState('won')
        } else if (isGameOver) {
          setGameState('lost')
        }
      }

      // Reset để nhập lượt tiếp theo
      resetRow()
    } catch (error) {
      console.error('[WordlePlayWeb] submit guess error:', error)
    } finally {
      isSubmittingRef.current = false
    }
  }

  // Handle menu popup
  const handleMenuClick = () => {
    setShowMenuPopup(true)
  }

  const handleContinue = () => {
    setShowMenuPopup(false)
  }

  const handleQuit = () => {
    setShowMenuPopup(false)
    router.back()
  }

  const handleHowToPlay = useCallback(() => {
    // close menu first so spotlight can see targets behind it
    setShowMenuPopup(false)
    requestAnimationFrame(() => {
      setTourRun(true)
    })
  }, [])

  const handlePlayWordAudio = useCallback(() => {
    if (Platform.OS !== 'web') return
    const url = wordResult?.audioUrl
    if (!url) return
    try {
      const audio = new Audio(url)
      audio.play().catch((err) => console.log('[WordlePlayWeb] play word audio error:', err))
    } catch (e) {
      console.error('[WordlePlayWeb] Failed to create audio element:', e)
    }
  }, [wordResult])

  // Auto-run tour only once on first enter (web), using localStorage
  useEffect(() => {
    try {
      if (hasSeenHowToPlayTour()) return
      // Delay 1 frame so targets are mounted before Joyride starts
      requestAnimationFrame(() => {
        setTourRun(true)
      })
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          {/* Volume control (Howler + slider) góc trái */}
          <View style={styles.volumeWrapper}>
            <VolumeControl />
          </View>

          <Text style={styles.title}>Wordle</Text>
          <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>
          
          {/* Actions góc phải: Cách chơi + Menu */}
          <View style={styles.headerRightActions}>
            <Pressable style={styles.howToBtn} onPress={handleHowToPlay}>
              <Text style={styles.howToText}>Cách chơi</Text>
            </Pressable>
            <Pressable nativeID="tour-menu" style={styles.menuBtn} onPress={handleMenuClick}>
              <Image source={MenuIcon} style={styles.menuIcon} />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.gameLayout}>
            {/* Thông tin từ vựng sau khi đoán đúng */}
            {gameState === 'won' && wordResult && (
              <View style={styles.wordInfoCard}>
                <Text style={styles.wordInfoWord}>{wordResult.word || targetWord}</Text>
                {!!wordResult.definition && (
                  <>
                    <Text style={styles.wordInfoLabel}>Định nghĩa</Text>
                    <Text style={styles.wordInfoDefinition}>{wordResult.definition}</Text>
                  </>
                )}
                {!!wordResult.imageUrl && (
                  <Image
                    source={{ uri: wordResult.imageUrl }}
                    style={styles.wordInfoImage}
                    resizeMode="contain"
                  />
                )}
                {!!wordResult.audioUrl && (
                  <Pressable style={styles.wordInfoAudioButton} onPress={handlePlayWordAudio}>
                    <Text style={styles.wordInfoAudioText}>🔊 Nghe phát âm</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Grid ở giữa */}
            <View nativeID="tour-grid" style={styles.gridContainer}>
              <WordleGrid
                rows={gameState === 'won' ? [] : rows}
                maxGuesses={gameState === 'won' ? 0 : MAX_GUESSES}
                wordLength={WORD_LENGTH}
                targetWord={targetWord}
                gridCells={gridCells}
                gameState={gameState}
                activeColIndex={activeColIndex}
                onCellClick={handleCellClick}
              />
            </View>
          </View>

          {/* Keyboard ở giữa - chỉ hiện khi đang chơi */}
          {gameState === 'playing' && (
            <View nativeID="tour-keyboard" style={styles.keyboardContainer}>
              <WordleKeyboard
                rows={rows}
                onKeyPress={handleVirtualKey}
              />
            </View>
          )}

          <WordleSentenceFlow
            gameState={gameState}
            dailyWordleId={dailyWordleId}
            onNavigateToBoard={() =>
              router.push(`/minigame/wordle/wordle-board?dailyWordleId=${dailyWordleId}`)
            }
            onRestart={() => {
              setRows([])
              setGameState('playing')
              resetRow()
              setTargetWord('')
              setWordResult(null)
            }}
          />
        </View>
      </View>

      <HowToPlayTour
        run={tourRun}
        setRun={setTourRun}
      />

      {/* Hidden IME input for Korean composition on web */}
      {Platform.OS === 'web' && (
        <input
          ref={hiddenImeInputRef}
          style={styles.hiddenImeInput}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          tabIndex={-1}
          onKeyDown={handleHiddenInputKeyDown}
          onPaste={handleHiddenInputPaste}
          onCompositionStart={handleHiddenInputCompositionStart}
          onCompositionUpdate={handleHiddenInputCompositionUpdate}
          onCompositionEnd={handleHiddenInputCompositionEnd}
          onBeforeInput={handleHiddenInputBeforeInput}
          onInput={handleHiddenInputInput}
          onBlur={handleHiddenInputBlur}
        />
      )}

      {/* Menu Popup */}
      {showMenuPopup && <WordleMenuPopup onContinue={handleContinue} onQuit={handleQuit} />}
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingTop: 20,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  volumeWrapper: {
    position: 'absolute',
    left: 20,
    top: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1b',
    letterSpacing: 2,
  },
  topic: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
    fontWeight: '600',
  },
  headerRightActions: {
    position: 'absolute',
    right: 20,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  howToBtn: {
    paddingVertical: 7,
    paddingHorizontal: 25,
    borderRadius: 12,
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#654321',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  howToText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    ...(Platform.OS === 'web' && { fontFamily: 'Epilogue, sans-serif' }),
  },
  menuIcon: {
    width: 80,
    height: 36,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    overflow: 'hidden',
    minHeight: 0,
  },
  gameLayout: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    flexShrink: 1,
    minHeight: 0,
  },
  keyboardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    flexShrink: 0,
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexShrink: 1,
    minHeight: 0,
  },
  wordInfoCard: {
    width: '100%',
    maxWidth: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: 'center',
  },
  wordInfoWord: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1b',
    marginBottom: 4,
  },
  wordInfoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6AAA64',
    marginTop: 4,
    marginBottom: 4,
  },
  wordInfoDefinition: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  wordInfoImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  wordInfoAudioButton: {
    marginTop: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#6AAA64',
  },
  wordInfoAudioText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sentenceBox: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 800,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  sentenceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6aaa64',
    marginBottom: 5,
  },
  sentenceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  submitSentenceBtn: {
    backgroundColor: '#6aaa64',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  submitSentenceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  finalSentence: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  restartBtn: {
    backgroundColor: '#7FA14D',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  restartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal confirm submit sentence
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3200,
  },
  confirmCard: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: '#FFF5E6',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4E342E',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButtonPrimary: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonSecondary: {
    flex: 1,
    backgroundColor: '#CFD8DC',
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
  },
  loadingOverlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3300,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
    minWidth: 260,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1B5E20',
    textAlign: 'center',
  },
  bottomBarPlaceholder: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    marginTop: 16,
  },
  hiddenImeInput: {
    position: 'absolute',
    left: -9999,
    width: 1,
    height: 1,
    opacity: 0,
    borderWidth: 0,
    outlineStyle: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    caretColor: 'transparent',
    pointerEvents: 'none',
  },
})


export default WordlePlayWeb

