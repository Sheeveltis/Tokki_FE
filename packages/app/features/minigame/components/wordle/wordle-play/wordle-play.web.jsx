import React, { useState, useEffect, useMemo, useRef } from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Platform, ActivityIndicator } from 'react-native'
import { useRouter } from 'solito/navigation'

import { WordleGrid } from './components/WordleGrid'
import { WordleInputBar } from './components/WordleInputBar'
import { WordleKeyboard } from './components/WordleKeyboard'
import { WordlePublishPopup } from './components/WordlePublishPopup'
import { WordleFeedbackModal } from './components/WordleFeedbackModal'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import ThemeMusic from '../../../../../../assets/sound-effect/solitare/theme.mp3'
import TapSound from '../../../../../../assets/sound-effect/solitare/tap.wav'
import FailSound from '../../../../../../assets/sound-effect/solitare/fail.wav'
import SuccessSound from '../../../../../../assets/sound-effect/solitare/success.wav'
import { submitWordleGuess, getWordleResult, submitWordleSentence, publishWordleSentence } from '../../../api/wordle-level-api'

// Các jamo Hangul cho bàn phím
const HANGUL_JAMO = [
  'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ',
  'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ',
  'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅆ', 'ㄲ', 'ㄸ', 'ㅉ', 'ㅃ'
]

// Mapping jamo to Hangul composition indices
const INITIAL_CONSONANTS = {
  'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6, 'ㅂ': 7, 'ㅃ': 8,
  'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13, 'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18
}

const VOWELS = {
  'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6, 'ㅖ': 7,
  'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13, 'ㅝ': 14, 'ㅞ': 15,
  'ㅟ': 16, 'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
}

const FINAL_CONSONANTS = {
  'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 3, 'ㄴ': 4, 'ㄵ': 5, 'ㄶ': 6, 'ㄷ': 7, 'ㄹ': 8,
  'ㄺ': 9, 'ㄻ': 10, 'ㄼ': 11, 'ㄽ': 12, 'ㄾ': 13, 'ㄿ': 14, 'ㅀ': 15,
  'ㅁ': 16, 'ㅂ': 17, 'ㅄ': 18, 'ㅅ': 19, 'ㅆ': 20, 'ㅇ': 21, 'ㅈ': 22,
  'ㅊ': 23, 'ㅋ': 24, 'ㅌ': 25, 'ㅍ': 26, 'ㅎ': 27
}

// Mapping các nguyên âm kép (diphthongs)
const DIPHTHONGS = {
  'ㅗㅏ': 'ㅘ',  // ㅗ + ㅏ = ㅘ
  'ㅜㅓ': 'ㅝ',  // ㅜ + ㅓ = ㅝ
  'ㅡㅣ': 'ㅢ',  // ㅡ + ㅣ = ㅢ
  'ㅗㅣ': 'ㅚ',  // ㅗ + ㅣ = ㅚ
}

// Hàm ghép jamo thành ký tự Hangul
function composeHangul(jamoSequence) {
  if (!jamoSequence || jamoSequence.length === 0) return ''
  
  // Tạo một bản sao để xử lý
  let processedSequence = [...jamoSequence]
  
  // Xử lý các nguyên âm kép trước
  // Kiểm tra từ đầu đến cuối để tìm các cặp nguyên âm kép
  for (let i = 0; i < processedSequence.length - 1; i++) {
    const pair = processedSequence[i] + processedSequence[i + 1]
    if (DIPHTHONGS[pair]) {
      // Thay thế cặp nguyên âm bằng nguyên âm kép
      processedSequence.splice(i, 2, DIPHTHONGS[pair])
      break // Chỉ xử lý một cặp tại một thời điểm
    }
  }
  
  let initial = null
  let vowel = null
  let final = null
  
  for (const jamo of processedSequence) {
    if (INITIAL_CONSONANTS.hasOwnProperty(jamo) && initial === null) {
      initial = INITIAL_CONSONANTS[jamo]
    } else if (VOWELS.hasOwnProperty(jamo) && vowel === null && initial !== null) {
      vowel = VOWELS[jamo]
    } else if (FINAL_CONSONANTS.hasOwnProperty(jamo) && vowel !== null && final === null) {
      final = FINAL_CONSONANTS[jamo]
    }
  }
  
  // Nếu chưa đủ initial và vowel, trả về chuỗi jamo gốc
  if (initial === null || vowel === null) {
    return jamoSequence.join('')
  }
  
  // Ghép thành ký tự Hangul: (initial * 588) + (vowel * 28) + final + 0xAC00
  const codePoint = 0xAC00 + (initial * 588) + (vowel * 28) + (final || 0)
  return String.fromCharCode(codePoint)
}

export function WordlePlayWeb({ level = 1, dailyWordleId, initialWordLength }) {
  const router = useRouter()
  const WORD_LENGTH = initialWordLength || 2
  const MAX_GUESSES = 6
  const TOPIC_NAME = '' // backend có thể trả sau
  const [rows, setRows] = useState([]) // mỗi row = mảng feedbacks từ API
  const [currentGuess, setCurrentGuess] = useState('') // Chuỗi ký tự Hangul đã ghép
  const [currentJamoSequences, setCurrentJamoSequences] = useState([]) // Mảng các sequence jamo cho mỗi ô
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  const [sentence, setSentence] = useState('')
  const [isSentenceSubmitted, setIsSentenceSubmitted] = useState(false)
  const [targetWord, setTargetWord] = useState('') // Từ đã đoán đúng
  const [showPublishPopup, setShowPublishPopup] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  
  // Audio refs
  const backgroundMusicRef = useRef(null)
  const tapSoundRef = useRef(null)
  const failSoundRef = useRef(null)
  const successSoundRef = useRef(null)
  
  // Dùng các jamo Hangul cố định cho bàn phím
  const keyboardKeys = HANGUL_JAMO

  // Initialize audio
  useEffect(() => {
    // Background music
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio(ThemeMusic)
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = 0.5
      
      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Background music will play after user interaction')
        })
      }
    }

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

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current = null
      }
    }
  }, [])

  const handleKeyClick = (key) => {
    if (gameState !== 'playing') return

    // Phát tap sound khi click phím (trừ nút Gửi và Xóa)
    if (key !== 'Gửi' && key !== 'Xóa' && tapSoundRef.current) {
      tapSoundRef.current.currentTime = 0
      tapSoundRef.current.play().catch(err => console.log('Tap sound play error:', err))
    }

    if (key === 'Xóa') {
      // Xóa jamo cuối cùng trong ô hiện tại
      setCurrentJamoSequences(prev => {
        const newSequences = [...prev]
        if (newSequences.length === 0) return prev
        
        const lastIndex = newSequences.length - 1
        const lastSequence = newSequences[lastIndex]
        
        if (lastSequence && lastSequence.length > 0) {
          // Xóa jamo cuối cùng trong ô cuối
          newSequences[lastIndex] = lastSequence.slice(0, -1)
          // Nếu ô đó trở thành rỗng, xóa cả ô đó
          if (newSequences[lastIndex].length === 0) {
            newSequences.pop()
          }
        } else {
          // Nếu ô cuối đã rỗng, xóa cả ô đó
          newSequences.pop()
        }
        
        // Cập nhật currentGuess
        const newGuess = newSequences.map(seq => composeHangul(seq)).join('')
        setCurrentGuess(newGuess)
        return newSequences
      })
    } else if (key === 'Gửi') {
      handleSubmit()
    } else if (currentJamoSequences.length < WORD_LENGTH || 
               (currentJamoSequences.length > 0 && currentJamoSequences[currentJamoSequences.length - 1].length < 3)) {
      // Thêm jamo vào ô đang nhập (ô cuối cùng chưa đủ 3 jamo)
      setCurrentJamoSequences(prev => {
        const newSequences = [...prev]
        
        // Tìm ô cuối cùng chưa đủ 3 jamo
        let targetIndex = -1
        for (let i = 0; i < newSequences.length; i++) {
          const seq = newSequences[i] || []
          if (seq.length < 3) {
            targetIndex = i
            break
          }
        }
        
        // Nếu tất cả các ô đã đủ 3 jamo và chưa đủ WORD_LENGTH ô, tạo ô mới
        if (targetIndex === -1 && newSequences.length < WORD_LENGTH) {
          targetIndex = newSequences.length
        }
        
        // Nếu không tìm thấy ô hợp lệ, không thêm
        if (targetIndex === -1 || targetIndex >= WORD_LENGTH) {
          return prev
        }
        
        if (!newSequences[targetIndex]) {
          newSequences[targetIndex] = []
        }
        
        // Chỉ thêm nếu chưa đủ 3 jamo
        if (newSequences[targetIndex].length < 3) {
          newSequences[targetIndex] = [...newSequences[targetIndex], key]
        }
        
        // Cập nhật currentGuess với ký tự Hangul đã ghép
        const newGuess = newSequences.map(seq => composeHangul(seq)).join('')
        setCurrentGuess(newGuess)
        return newSequences
      })
    }
  }

  // Hỗ trợ bàn phím vật lý và ngăn chặn paste
  useEffect(() => {
    const handlePaste = (e) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return

      if (e.key === 'Backspace') {
        e.preventDefault()
        handleKeyClick('Xóa')
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleKeyClick('Gửi')
      } else if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        // Ngăn chặn paste
        e.preventDefault()
        e.stopPropagation()
        return false
      } else {
        // Cho phép nhập jamo từ bàn phím vật lý
        if (keyboardKeys.includes(e.key)) {
          e.preventDefault()
          handleKeyClick(e.key)
        }
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown)
      window.addEventListener('paste', handlePaste)
      // Ngăn chặn drag & drop
      window.addEventListener('dragover', (e) => e.preventDefault())
      window.addEventListener('drop', (e) => e.preventDefault())
    }
    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('paste', handlePaste)
        window.removeEventListener('dragover', (e) => e.preventDefault())
        window.removeEventListener('drop', (e) => e.preventDefault())
      }
    }
  }, [gameState, currentGuess, keyboardKeys])

  const handleSubmit = async () => {
    if (gameState !== 'playing') return
    // Kiểm tra xem tất cả các ô đã có đủ 3 jamo chưa
    const allCellsComplete = currentJamoSequences.length === WORD_LENGTH && 
                              currentJamoSequences.every(seq => seq && seq.length === 3)
    if (!allCellsComplete || currentGuess.length !== WORD_LENGTH) return
    if (!dailyWordleId) {
      console.error('[WordlePlayWeb] Missing dailyWordleId')
      return
    }

    try {
      // guessWord là chuỗi không có khoảng cách giữa các chữ
      const guessWord = currentGuess.replace(/\s/g, '')
      
      const data = await submitWordleGuess(dailyWordleId, guessWord)
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
      setCurrentGuess('')
      setCurrentJamoSequences([])
    } catch (error) {
      console.error('[WordlePlayWeb] submit guess error:', error)
    }

  }

  // B1: khi bấm submit trên InputBar -> hỏi confirm trước
  const handleSentenceSubmit = () => {
    if (!sentence.trim()) {
      console.error('[WordlePlayWeb] Sentence is empty')
      return
    }
    if (!dailyWordleId) {
      console.error('[WordlePlayWeb] Missing dailyWordleId')
      return
    }
    setShowSubmitConfirm(true)
  }

  // B2: sau khi confirm mới gọi API submit-sentence và hiển thị feedback modal
  const handleConfirmSubmitSentence = async () => {
    if (!sentence.trim()) {
      setShowSubmitConfirm(false)
      return
    }
    if (!dailyWordleId) {
      console.error('[WordlePlayWeb] Missing dailyWordleId')
      setShowSubmitConfirm(false)
      return
    }

    setShowSubmitConfirm(false)

    try {
      setFeedbackLoading(true)
      // Giới hạn 150 ký tự
      const sentenceContent = sentence.trim().substring(0, 150)

      const response = await submitWordleSentence(dailyWordleId, sentenceContent)

      // Lấy submissionId từ response
      const id = response?.submissionId || response?.data?.submissionId || response?.id
      if (id) {
        setSubmissionId(id)
      }

      // Lưu feedback để hiển thị trong modal
      const feedbackPayload = {
        targetWord: response?.targetWord || '',
        meaningText: response?.meaning || '',
        aiFeedback: response?.aiFeedback || {},
      }

      setFeedbackData(feedbackPayload)
      setIsSentenceSubmitted(true)
      setShowFeedbackModal(true)
    } catch (error) {
      console.error('[WordlePlayWeb] Error submitting sentence:', error)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleCancelSubmitSentence = () => {
    setShowSubmitConfirm(false)
  }

  // B3: sau khi xem feedback, quyết định có được phép publish hay không
  const handleFeedbackConfirm = () => {
    if (!feedbackData?.aiFeedback) {
      setShowFeedbackModal(false)
      return
    }

    const totalScore = Number(feedbackData.aiFeedback.totalScore ?? 0)
    setShowFeedbackModal(false)

    if (totalScore > 80) {
      // Cho phép publish -> hiện popup publish
      setShowPublishPopup(true)
    } else {
      // Không đủ điểm -> chuyển thẳng sang bảng xếp hạng
      router.push(`/minigame/wordle/wordle-board?dailyWordleId=${dailyWordleId}`)
    }
  }

  const handlePublishConfirm = async () => {
    if (!submissionId) {
      console.error('[WordlePlayWeb] Missing submissionId')
      setShowPublishPopup(false)
      return
    }

    try {
      setPublishLoading(true)
      await publishWordleSentence(submissionId, true, false) // isPublic: true, isAnonymous: false
      setShowPublishPopup(false)
      // Navigate đến wordle-board sau khi publish thành công
      router.push(`/minigame/wordle/wordle-board?dailyWordleId=${dailyWordleId}`)
    } catch (error) {
      console.error('[WordlePlayWeb] Error publishing sentence:', error)
    } finally {
      setPublishLoading(false)
    }
  }

  const handlePublishCancel = async () => {
    if (!submissionId) {
      console.error('[WordlePlayWeb] Missing submissionId')
      setShowPublishPopup(false)
      return
    }

    try {
      setPublishLoading(true)
      await publishWordleSentence(submissionId, false, true) // isPublic: false, isAnonymous: true
      setShowPublishPopup(false)
      // Navigate đến wordle-board sau khi set private thành công
      router.push(`/minigame/wordle/wordle-board?dailyWordleId=${dailyWordleId}`)
    } catch (error) {
      console.error('[WordlePlayWeb] Error setting sentence to private:', error)
    } finally {
      setPublishLoading(false)
    }
  }

  // Tính toán trạng thái của từng phím dựa trên feedbacks từ API
  const keyStatuses = useMemo(() => {
    const map = {}
    rows.forEach((row) => {
      row.forEach((fb) => {
        const { character, blockColor } = fb || {}
        if (!character) return
        const color = (blockColor || '').toLowerCase()
        if (color === 'green') {
          map[character] = 'correct'
        } else if (color === 'yellow' && map[character] !== 'correct') {
          map[character] = 'present'
        } else if (color === 'gray' && !map[character]) {
          map[character] = 'absent'
        }
      })
    })
    return map
  }, [rows])

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Wordle</Text>
          <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Trở lại</Text>
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
                currentGuess={currentGuess}
                jamoSequences={currentJamoSequences}
                gameState={gameState}
                onCellClick={(index) => {
                  // Khi click vào cell, focus vào ô đó
                  if (index <= currentGuess.length) {
                    // Cắt currentGuess và currentJamoSequences đến index đó
                    setCurrentJamoSequences(prev => {
                      const newSequences = prev.slice(0, index)
                      const newGuess = newSequences.map(seq => composeHangul(seq)).join('')
                      setCurrentGuess(newGuess)
                      return newSequences
                    })
                  }
                }}
              />
            </View>
          </View>

          {/* Keyboard ở giữa - chỉ hiện khi đang chơi */}
          {gameState === 'playing' && (
            <View style={styles.keyboardContainer}>
              <WordleKeyboard
                keyStatuses={keyStatuses}
                onPress={handleKeyClick}
              />
            </View>
          )}

          {/* InputBar - chỉ hiện khi đoán xong từ */}
          {gameState === 'won' && !isSentenceSubmitted && (
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceTitle}>Hãy nhập 1 câu có chứa từ mà bạn đã đoán đúng</Text>
              <WordleInputBar
                value={sentence}
                onChange={setSentence}
                onSubmit={handleSentenceSubmit}
                maxLength={150}
                disabled={false}
              />
            </View>
          )}

          {/* Popup confirm trước khi gửi câu văn cho AI chấm điểm */}
          {showSubmitConfirm && (
            <View style={styles.modalOverlay}>
              <View style={styles.confirmCard}>
                <Text style={styles.confirmTitle}>Bạn có chắc chắn muốn gửi câu văn này?</Text>
                <Text style={styles.confirmMessage}>
                  Câu của bạn sẽ được gửi để AI chấm điểm và đưa ra nhận xét.
                </Text>
                <View style={styles.confirmButtons}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButtonSecondary,
                      pressed && styles.confirmButtonPressed,
                    ]}
                    onPress={handleCancelSubmitSentence}
                  >
                    <Text style={styles.confirmSecondaryText}>Hủy</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.confirmButtonPrimary,
                      pressed && styles.confirmButtonPressed,
                    ]}
                    onPress={handleConfirmSubmitSentence}
                  >
                    <Text style={styles.confirmPrimaryText}>Gửi</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Loading overlay khi đang chờ AI chấm điểm câu văn */}
          {feedbackLoading && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang chấm điểm câu văn...</Text>
              </View>
            </View>
          )}

          {/* Modal feedback chi tiết sau khi submit câu */}
          <WordleFeedbackModal
            visible={showFeedbackModal}
            loading={feedbackLoading}
            data={feedbackData}
            onConfirm={handleFeedbackConfirm}
          />

          {/* Popup hỏi có muốn công khai câu văn */}
          <WordlePublishPopup
            visible={showPublishPopup}
            loading={publishLoading}
            onConfirm={handlePublishConfirm}
            onCancel={handlePublishCancel}
          />

          {(gameState === 'lost' || (gameState === 'won' && isSentenceSubmitted)) && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                {gameState === 'won' ? '🎉 Chúc mừng bạn đã hoàn thành thử thách!' : '😢 Rất tiếc! Hãy thử lại lần sau!'}
              </Text>
              {gameState === 'won' && (
                <Text style={styles.finalSentence}>Câu văn của bạn: "{sentence}"</Text>
              )}
              <Pressable style={styles.restartBtn} onPress={() => {
      setRows([])
      setGameState('playing')
      setCurrentGuess('')
      setCurrentJamoSequences([])
      setSentence('')
      setIsSentenceSubmitted(false)
      setTargetWord('')
              }}>
                <Text style={styles.restartText}>Chơi lại</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
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
  backBtn: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
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
    position: 'absolute',
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
})


export default WordlePlayWeb

