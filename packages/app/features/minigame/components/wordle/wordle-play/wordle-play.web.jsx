import React, { useState, useEffect, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { VolumeControl } from './components/VolumeControl'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { useKoreanWordleIME } from './useKoreanWordleIME'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import TapSound from '../../../../../../assets/sound-effect/solitare/tap.wav'
import FailSound from '../../../../../../assets/sound-effect/solitare/fail.wav'
import SuccessSound from '../../../../../../assets/sound-effect/solitare/success.wav'
import { submitWordleGuess, getWordleResult } from '../../../api/wordle-level-api'

export function WordlePlayWeb({ level: _level = 1, dailyWordleId, initialWordLength }) {
  const router = useRouter()
  const WORD_LENGTH = initialWordLength || 2
  const MAX_GUESSES = 6
  const TOPIC_NAME = '' // backend có thể trả sau
  const [rows, setRows] = useState([]) // mỗi row = mảng feedbacks từ API
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  const [targetWord, setTargetWord] = useState('') // Từ đã đoán đúng
  const [showMenuPopup, setShowMenuPopup] = useState(false)
  
  // Audio refs (sound effects)
  const tapSoundRef = useRef(null)
  const failSoundRef = useRef(null)
  const successSoundRef = useRef(null)

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
    getCommittedWord,
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
  
      // 4) enter
      if (inputType === 'insertLineBreak') {
        e.preventDefault?.()
        handleVirtualKey('ENTER')
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
    requestAnimationFrame(() => {
      focusHiddenImeInput()
    })
  }, [focusHiddenImeInput])

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
    if (gameState !== 'playing') return
    if (!guessWord || guessWord.length !== WORD_LENGTH) return
    if (!dailyWordleId) {
      console.error('[WordlePlayWeb] Missing dailyWordleId')
      return
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
          
          // Gọi API để lấy kết quả
          try {
            const result = await getWordleResult(dailyWordleId)
            console.log('[WordlePlayWeb] Wordle result:', result)
            // Có thể xử lý result ở đây nếu cần
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
          
          {/* Menu button - right side (dùng icon gỗ giống Solitare) */}
          <Pressable style={styles.menuBtn} onPress={handleMenuClick}>
            <Image source={MenuIcon} style={styles.menuIcon} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.gameLayout}>
            {/* Grid ở giữa */}
            <View style={styles.gridContainer}>
              <WordleGrid
                rows={rows}
                maxGuesses={MAX_GUESSES}
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
            <View style={styles.keyboardContainer}>
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
            }}
          />
        </View>
      </View>

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
      {showMenuPopup && (
        <WordleMenuPopup onContinue={handleContinue} onQuit={handleQuit} />
      )}
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
  menuBtn: {
    position: 'absolute',
    right: 20,
    top: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  sentenceBox: {
    backgroundColor: '#fff',
    width: '95%',
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

