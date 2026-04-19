import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Platform, Image, Animated, Pressable } from 'react-native'
import { submitSpacedRepetitionWithCorrect } from '@tokki/app/features/study/api'
import { awardXP } from '@tokki/app/features/minigame/api/api'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import CheckedIcon from 'assets/checked.png'
import IncorrectIcon from 'assets/incorrect.png'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import CorrectSound from 'assets/sound-effect/correct.wav'
import WrongSound from 'assets/sound-effect/wrong.wav'

// Import expo-av cho mobile (nếu có)
let ExpoAudio = null
let ExpoAudioMode = null
if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av')
    ExpoAudio = expoAv.Audio
    ExpoAudioMode = expoAv.Audio
  } catch (e) {
    // expo-av chưa được cài đặt
    console.warn('expo-av not available, audio playback may not work on mobile', e)
  }
}

const GROUP_SIZE = 5

/**
 * LearnedVocabularyPracticeMode: Chế độ học tập từ vựng
 * Logic học:
 * - Chia từ vựng thành các nhóm 5 từ
 * - Mỗi nhóm học 2 lần: lần đầu random chế độ, lần sau chế độ còn lại
 * - Sau khi học xong một nhóm mới, quay lại nhóm trước học chế độ còn lại
 */

/**
 * CloseButton: Nút X với hiệu ứng hover
 */
const CloseButton = ({ onPress, style }) => {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
      style={[
        styles.closeButton,
        isHovered && styles.closeButtonHover,
        style
      ]}
    >
      <Text style={[
        styles.closeButtonIcon,
        isHovered && styles.closeButtonIconHover
      ]}>✕</Text>
    </TouchableOpacity>
  )
}

export function LearnedVocabularyPracticeMode({
  vocabularies = [],
  loading = false,
  onBack,
  onPracticeComplete,
}) {
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [xpAwardedIds, setXpAwardedIds] = useState(new Set()) // Track vocab IDs that already received XP in this session
  const [failedVocabIds, setFailedVocabIds] = useState(new Set()) // Track vocab IDs that were wrong
  const [failedVocabList, setFailedVocabList] = useState([]) // For summary screen
  const [isFinished, setIsFinished] = useState(false) // Toggle summary screen

  const audioRef = useRef(null)
  const soundRef = useRef(null)
  const soundEffectRef = useRef(null)
  const inputRef = useRef(null)

  // Setup audio mode khi component mount (chỉ mobile)
  useEffect(() => {
    if (Platform.OS === 'web') return
    if (!ExpoAudioMode) return

    const setupAudio = async () => {
      try {
        // Set audio mode trước
        await ExpoAudioMode.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
      } catch (e) {
        // Failed to set audio mode
        console.warn('Failed to set audio mode:', e)
      }
    }

    setupAudio()
  }, [])

  // Cleanup audio
  const cleanupAudio = useCallback(async () => {
    try {
      // Web: cleanup HTML5 Audio
      if (audioRef.current) {
        try {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        } catch (e) {
          // Ignore errors
        }
        audioRef.current = null
      }
      // Mobile: cleanup expo-av sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync()
        } catch (e) {
          // Ignore errors
        }
        soundRef.current = null
      }
      // Cleanup sound effect
      if (soundEffectRef.current) {
        try {
          if (Platform.OS === 'web') {
            soundEffectRef.current.pause()
            soundEffectRef.current.currentTime = 0
          } else {
            await soundEffectRef.current.unloadAsync()
          }
        } catch (e) {
          // Ignore errors
        }
        soundEffectRef.current = null
      }
    } catch (error) {
      console.error('Error cleaning up audio:', error)
    }
  }, [])

  // Chia từ vựng thành các nhóm 5 từ
  const groups = useMemo(() => {
    const result = []
    for (let i = 0; i < vocabularies.length; i += GROUP_SIZE) {
      result.push(vocabularies.slice(i, i + GROUP_SIZE))
    }
    return result
  }, [vocabularies])

  // Tạo queue học tập: Một danh sách bẹt gồm các tasks { vocab, mode }
  const practiceQueue = useMemo(() => {
    if (groups.length === 0) return []

    // Tạo các Passes cho mỗi nhóm
    const groupPasses = groups.map((group, groupIndex) => {
      // Mỗi từ trong nhóm sẽ có 1 mode ngẫu nhiên cho pass đầu
      const pass1Tasks = group.map(vocab => ({
        vocab,
        mode: Math.random() < 0.5 ? 'meaning' : 'listen'
      }))

      // Pass 2 là mode ngược lại
      const pass2Tasks = pass1Tasks.map(task => ({
        vocab: task.vocab,
        mode: task.mode === 'meaning' ? 'listen' : 'meaning'
      }))

      // Shuffle thứ tự từ trong mỗi pass để tăng tính ngẫu nhiên
      const shuffle = (array) => {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [result[i], result[j]] = [result[j], result[i]]
        }
        return result
      }

      return {
        pass1: shuffle(pass1Tasks),
        pass2: shuffle(pass2Tasks)
      }
    })

    // Lồng ghép (interweave) các passes theo logic: G0P1, G1P1, G0P2, G2P1, G1P2, G3P1, G2P2...
    const finalQueue = []

    // Thực hiện interweave giống logic cũ nhưng ở mức task bẹt
    for (let i = 0; i < groups.length; i++) {
      // Lần đầu học nhóm này
      finalQueue.push(...groupPasses[i].pass1)

      // Nếu không phải nhóm đầu tiên, xen kẽ nhóm trước đó học lần 2
      if (i > 0) {
        finalQueue.push(...groupPasses[i - 1].pass2)
      }
    }

    // Thêm lượt học cuối cùng cho nhóm cuối cùng
    if (groups.length > 0) {
      finalQueue.push(...groupPasses[groups.length - 1].pass2)
    }

    return finalQueue
  }, [groups])

  // Lấy thông tin học tập hiện tại từ queue bẹt
  const currentTask = practiceQueue[currentQueueIndex]
  const currentVocab = currentTask?.vocab
  const currentMode = currentTask?.mode || 'meaning'

  // Tính tổng số từ cần học (mỗi từ học 2 lần)
  const totalVocabCount = vocabularies.length * 2
  const completedCount = currentQueueIndex

  const progress = totalVocabCount > 0 ? (completedCount / totalVocabCount) * 100 : 0
  const animatedProgress = useRef(new Animated.Value(progress)).current
  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start()
  }, [progress])

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  // Reset state khi chuyển từ vựng hoặc chế độ
  useEffect(() => {
    setUserAnswer('')
    setShowResult(false)
    setIsCorrect(false)
    setHasAnswered(false)
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [currentQueueIndex, currentMode])


  // Phát âm thanh
  const handlePlaySound = useCallback(async () => {
    if (!currentVocab?.audioUrl) {
      console.warn('[Audio] No audioUrl for current word')
      return
    }

    console.log('[Audio] Attempting to play:', currentVocab.audioUrl)

    try {
      if (Platform.OS === 'web') {
        // Web: sử dụng HTML5 Audio
        await cleanupAudio()
        // Kiểm tra kỹ hơn để tránh lỗi trên mobile
        if (typeof window === 'undefined' || !window.Audio) {
          console.error('[Audio] Audio API not available')
          return
        }
        const AudioConstructor = window.Audio
        const audio = new AudioConstructor(currentVocab.audioUrl)
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
          console.log('[Audio] Creating sound with URI:', currentVocab.audioUrl)
          const { sound } = await ExpoAudio.Sound.createAsync(
            { uri: currentVocab.audioUrl },
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
              soundRef.current = null
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
    } catch (error) {
      console.error('[Audio] Error playing audio:', error)
    }
  }, [currentVocab, cleanupAudio])

  // Phát âm thanh effect (correct/wrong)
  const playSoundEffect = useCallback(async (soundFile) => {
    if (!soundFile) return

    try {
      if (Platform.OS === 'web') {
        // Web: sử dụng HTML5 Audio
        if (typeof window === 'undefined' || !window.Audio) {
          return
        }
        // Cleanup sound effect cũ nếu có
        if (soundEffectRef.current) {
          try {
            soundEffectRef.current.pause()
            soundEffectRef.current.currentTime = 0
          } catch (e) {
            // Ignore errors
          }
        }
        // normalizeImageSource trả về URI cho web
        const soundUri = typeof soundFile === 'string' ? soundFile : (soundFile.uri || soundFile)
        const audio = new window.Audio(soundUri)
        soundEffectRef.current = audio
        audio.volume = 1.0
        audio.play().catch((err) => {
          console.error('[SoundEffect] Error playing audio on web:', err)
        })
        audio.addEventListener('ended', () => {
          soundEffectRef.current = null
        })
      } else {
        // Mobile: sử dụng expo-av
        if (!ExpoAudio) {
          return
        }
        try {
          // Cleanup sound effect cũ nếu có
          if (soundEffectRef.current) {
            try {
              await soundEffectRef.current.unloadAsync()
            } catch (e) {
              // Ignore errors
            }
          }
          // expo-av cần require() trực tiếp hoặc uri
          // soundFile có thể là number (require result) hoặc object với uri
          const soundSource = typeof soundFile === 'number'
            ? soundFile
            : (soundFile.uri ? { uri: soundFile.uri } : soundFile)
          const { sound } = await ExpoAudio.Sound.createAsync(
            soundSource,
            {
              shouldPlay: true,
              volume: 1.0,
              isMuted: false,
            }
          )
          soundEffectRef.current = sound
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              soundEffectRef.current = null
            }
          })
        } catch (err) {
          console.error('[SoundEffect] Error playing audio on mobile:', err)
        }
      }
    } catch (error) {
      console.error('[SoundEffect] Error playing sound effect:', error)
    }
  }, [])

  // Submit kết quả
  const submitAnswer = useCallback(async (isCorrectResult) => {
    if (!currentVocab || isSubmitting) return

    try {
      setIsSubmitting(true)
      await submitSpacedRepetitionWithCorrect(currentVocab.id, isCorrectResult)
    } catch (error) {
      console.error('Error submitting spaced repetition:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentVocab, isSubmitting])

  // Kiểm tra đáp án
  const checkAnswer = useCallback(() => {
    if (!currentVocab || hasAnswered || !userAnswer.trim()) return

    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentVocab.word.trim().toLowerCase()
    const correct = normalizedUserAnswer === normalizedCorrectAnswer

    setIsCorrect(correct)
    setShowResult(true)
    setHasAnswered(true)

    // Phát âm âm thanh effect
    if (correct) {
      playSoundEffect(Platform.OS === 'web' ? normalizeImageSource(CorrectSound) : CorrectSound)
    } else {
      playSoundEffect(Platform.OS === 'web' ? normalizeImageSource(WrongSound) : WrongSound)
      // Thêm vào danh sách sai và đánh dấu để bỏ qua các step sau
      setFailedVocabIds((prev) => new Set([...prev, currentVocab.id]))
      setFailedVocabList((prev) => {
        if (!prev.find(v => v.id === currentVocab.id)) {
          return [...prev, currentVocab]
        }
        return prev
      })
    }

    // Cộng XP nếu đúng và đúng hạn
    if (correct && currentVocab?.id && !xpAwardedIds.has(currentVocab.id)) {
      const now = new Date()
      const nextReviewAt = currentVocab.nextReviewAt ? new Date(currentVocab.nextReviewAt) : null

      // Nếu không có nextReviewAt hoặc nextReviewAt <= now thì được coi là đúng hạn
      if (!nextReviewAt || nextReviewAt <= now) {
        awardXP(5).catch((err) => {
          console.error('[awardXP] Failed to award XP for SRS review:', err)
        })
        setXpAwardedIds((prev) => new Set([...prev, currentVocab.id]))
      }
    }

    // Chỉ nộp true nếu đây là lần cuối cùng từ này xuất hiện trong queue và người dùng trả lời đúng
    // Nếu sai thì nộp false ngay lập tức
    const isLastStepForThisVocab = !practiceQueue.slice(currentQueueIndex + 1).some(task => task.vocab?.id === currentVocab.id)

    if (!correct) {
      submitAnswer(false)
    } else if (isLastStepForThisVocab) {
      submitAnswer(true)
    }
  }, [currentVocab, userAnswer, hasAnswered, practiceQueue, currentQueueIndex, playSoundEffect, xpAwardedIds, submitAnswer])

  // Chuyển từ tiếp theo hoặc nhóm tiếp theo
  const handleNext = useCallback(() => {
    let nextIndex = currentQueueIndex + 1

    // Tìm index tiếp theo mà từ vựng đó chưa bị sai trước đó
    while (nextIndex < practiceQueue.length) {
      const nextTask = practiceQueue[nextIndex]
      if (!failedVocabIds.has(nextTask.vocab?.id)) {
        break
      }
      nextIndex++
    }

    if (nextIndex < practiceQueue.length) {
      setCurrentQueueIndex(nextIndex)
    } else {
      // Hoàn thành tất cả
      setIsFinished(true)
    }
  }, [currentQueueIndex, practiceQueue, failedVocabIds])

  // Phím tắt Enter (Web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyDown = (event) => {
      if (event.key !== 'Enter') return

      if (!hasAnswered) {
        // Nếu chưa trả lời, kiểm tra kết quả
        checkAnswer()
      } else {
        // Nếu đã hiện kết quả, sang từ tiếp theo
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasAnswered, checkAnswer, handleNext])

  // Tự động phát âm khi vào chế độ listen
  useEffect(() => {
    if (currentMode === 'listen' && currentVocab?.audioUrl && !hasAnswered) {
      const timer = setTimeout(() => {
        handlePlaySound()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentMode, currentQueueIndex, currentVocab, handlePlaySound, hasAnswered])

  // Cleanup audio khi unmount
  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])

  // Helper function để render SoundIcon
  const renderSoundIcon = (size = 32) => {
    if (!SoundIcon) {
      return null
    }

    try {
      // Kiểm tra xem có phải là React component không (SVG component)
      const isReactComponent = SoundIcon && (
        (typeof SoundIcon === 'function') ||
        (typeof SoundIcon === 'object' && SoundIcon.$$typeof) ||
        (typeof SoundIcon === 'object' && SoundIcon.default && (typeof SoundIcon.default === 'function' || SoundIcon.default.$$typeof))
      )

      if (isReactComponent) {
        // Render như React component (SVG)
        const Component = typeof SoundIcon === 'function' ? SoundIcon : (SoundIcon.default || SoundIcon)
        return (
          <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Component width={size} height={size} />
          </View>
        )
      }

      // Fallback: thử dùng Image với normalizeImageSource
      const iconSource = normalizeImageSource(SoundIcon)
      if (iconSource) {
        return <Image source={iconSource} style={{ width: size, height: size }} resizeMode="contain" />
      }

      return null
    } catch (error) {
      console.error('Error rendering SoundIcon:', error)
      return null
    }
  }

  if (isFinished) {
    const correctCount = vocabularies.length - failedVocabList.length
    const totalCount = vocabularies.length

    return (
      <View style={styles.container}>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Hoàn thành"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onPracticeComplete}
            textStyle={{ fontWeight: '700' }}
          />
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Kết quả luyện tập</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statItem, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>Chính xác</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>{failedVocabList.length}</Text>
              <Text style={styles.statLabel}>Cần ôn lại</Text>
            </View>
          </View>

          {failedVocabList.length > 0 && (
            <View style={styles.failedListSection}>
              <Text style={styles.sectionTitle}>Danh sách từ vựng cần lưu ý:</Text>
              <View style={styles.failedList}>
                {failedVocabList.map((vocab) => (
                  <View key={vocab.id} style={styles.failedItem}>
                    <View style={styles.failedItemInfo}>
                      <Text style={styles.failedItemWord}>{vocab.word}</Text>
                      <Text style={styles.failedItemMeaning}>{vocab.meaning}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.audioButtonSmallest}
                      onPress={async () => {
                        // Play audio for this vocab
                        if (vocab.audioUrl) {
                          if (Platform.OS === 'web') {
                            const audio = new Audio(vocab.audioUrl)
                            audio.play()
                          } else if (ExpoAudio) {
                            const { sound } = await ExpoAudio.Sound.createAsync({ uri: vocab.audioUrl }, { shouldPlay: true })
                            await sound.playAsync()
                          }
                        }
                      }}
                    >
                      {renderSoundIcon(18)}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Pressable
            style={({ hovered }) => [
              styles.nextButton,
              { marginTop: 24 },
              hovered && styles.nextButtonHover
            ]}
            onPress={onPracticeComplete}
          >
            <Text style={styles.nextButtonText}>Xong</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <CloseButton onPress={onBack} style={styles.absoluteCloseButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
        </View>
      </View>
    )
  }

  if (!currentTask || !currentVocab) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <CloseButton onPress={onBack} style={styles.absoluteCloseButton} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có từ vựng để học</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerProgressSection}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.progressText}>
            Tiến độ hoàn thành: <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{Math.round(progress)}%</Text>
          </Text>
        </View>
        <CloseButton onPress={onBack} style={styles.absoluteCloseButton} />
      </View>

      <View style={styles.practiceContainer}>
        {!showResult ? (
          <>
            {currentMode === 'meaning' && (
              <View style={styles.questionContainer}>
                <Text style={styles.instructionText}>Viết từ tiếng Hàn</Text>
                <View style={styles.meaningBox}>
                  <Text style={styles.meaningText}>{currentVocab.meaning}</Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.answerInput,
                    hasAnswered && (isCorrect ? styles.answerInputCorrect : styles.answerInputWrong)
                  ]}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Gõ từ tiếng Hàn..."
                  placeholderTextColor="#999"
                  onSubmitEditing={checkAnswer}
                  editable={!hasAnswered}
                  autoFocus
                />
                {!hasAnswered && (
                  <Pressable
                    style={({ hovered }) => [
                      styles.submitButton,
                      !userAnswer.trim() && styles.submitButtonDisabled,
                      userAnswer.trim() && hovered && styles.submitButtonHover
                    ]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim()}
                  >
                    <Text style={styles.submitButtonText}>Kiểm tra</Text>
                  </Pressable>
                )}
              </View>
            )}

            {currentMode === 'listen' && (
              <View style={styles.questionContainer}>
                <Text style={styles.instructionText}>Nghe và viết lại</Text>
                <View style={styles.audioButtonsContainer}>
                  <Pressable
                    style={({ hovered }) => [
                      styles.audioButton,
                      hovered && styles.audioButtonHover
                    ]}
                    onPress={handlePlaySound}
                  >
                    {renderSoundIcon(40)}
                  </Pressable>
                </View>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.answerInput,
                    hasAnswered && (isCorrect ? styles.answerInputCorrect : styles.answerInputWrong)
                  ]}
                  value={userAnswer}
                  onChangeText={setUserAnswer}
                  placeholder="Gõ lại từ bạn nghe được"
                  placeholderTextColor="#999"
                  onSubmitEditing={checkAnswer}
                  editable={!hasAnswered}
                  autoFocus
                />
                {!hasAnswered && (
                  <Pressable
                    style={({ hovered }) => [
                      styles.submitButton,
                      !userAnswer.trim() && styles.submitButtonDisabled,
                      userAnswer.trim() && hovered && styles.submitButtonHover
                    ]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim()}
                  >
                    <Text style={styles.submitButtonText}>Kiểm tra</Text>
                  </Pressable>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              {isCorrect ? (
                <View style={styles.resultCorrect}>
                  <Image
                    source={normalizeImageSource(CheckedIcon)}
                    style={styles.resultIconImageCorrect}
                    resizeMode="contain"
                    tintColor="#4CAF50"
                  />
                  <Text style={styles.resultTextCorrect}>Đúng rồi!</Text>
                </View>
              ) : (
                <View style={styles.resultWrong}>
                  <Image
                    source={normalizeImageSource(IncorrectIcon)}
                    style={styles.resultIconImageWrong}
                    resizeMode="contain"
                    tintColor="#F44336"
                  />
                  <Text style={styles.resultTextWrong}>Sai rồi!</Text>
                </View>
              )}
            </View>

            <View style={styles.flashcard}>
              {currentVocab.imageUrl && (
                <Image
                  source={normalizeImageSource(currentVocab.imageUrl)}
                  style={styles.flashcardImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.flashcardContent}>
                <View style={styles.flashcardHeader}>
                  <Pressable
                    style={({ hovered }) => [
                      styles.audioButtonSmall,
                      hovered && styles.audioButtonSmallHover
                    ]}
                    onPress={handlePlaySound}
                  >
                    {renderSoundIcon(24)}
                  </Pressable>
                  <Text style={styles.flashcardWord}>{currentVocab.word}</Text>
                </View>
                {currentVocab.pronunciation && (
                  <Text style={styles.flashcardPronunciation}>
                    {currentVocab.pronunciation}
                  </Text>
                )}
                <Text style={styles.flashcardMeaning}>{currentVocab.meaning}</Text>
                {!isCorrect && (
                  <View style={styles.wrongAnswerBox}>
                    <Text style={styles.wrongAnswerLabel}>Đáp án của bạn:</Text>
                    <Text style={styles.wrongAnswerText}>{userAnswer}</Text>
                  </View>
                )}
              </View>
            </View>

            <Pressable
              style={({ hovered }) => [
                styles.nextButton,
                hovered && styles.nextButtonHover
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentQueueIndex < practiceQueue.length - 1
                  ? 'Tiếp tục'
                  : 'Hoàn thành'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 12,
    paddingTop: 16,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    marginBottom: 8,
    position: 'relative',
    minHeight: 56,
  },
  headerProgressSection: {
    width: '100%',
    maxWidth: 600,
    gap: 6,
  },
  absoluteCloseButton: {
    position: 'absolute',
    right: 0,
    top: 10,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 16,
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 15,
    backgroundColor: '#E8E8E8',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 100,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(90deg, #F1BE4B, #FFD56B)',
      boxShadow: '0 0 10px rgba(241, 190, 75, 0.4)',
    }),
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  practiceContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 60,
    flex: 1,
  },
  questionContainer: {
    width: '100%',
    maxWidth: 550,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 20,
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginBottom: 8,
  },
  meaningBox: {
    width: '100%',
    maxWidth: 500,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    shadowColor: '#F1BE4B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  meaningText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 34,
  },
  audioButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F1BE4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  audioButtonHover: {
    backgroundColor: '#E5AF30',
    transform: 'scale(1.05)',
  },
  audioButtonSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  audioButtonSmallHover: {
    borderColor: '#F1BE4B',
    transform: 'scale(1.1)',
  },
  answerInput: {
    width: '100%',
    maxWidth: 500,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    fontSize: 18,
    fontWeight: '500',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  answerInputCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  answerInputWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  submitButton: {
    width: '100%',
    maxWidth: 500,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    shadowColor: '#F1BE4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  submitButtonHover: {
    backgroundColor: '#E5AF30',
    transform: 'translateY(-2px)',
    shadowOpacity: 0.4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  resultContainer: {
    width: '100%',
    maxWidth: 550,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 24,
  },
  resultHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resultCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultIcon: {
    fontSize: 40,
    fontWeight: '700',
  },
  resultIconCorrect: {
    fontSize: 40,
    fontWeight: '700',
    color: '#4CAF50',
  },
  resultIconWrong: {
    fontSize: 40,
    fontWeight: '700',
    color: '#F44336',
  },
  resultIconImage: {
    width: 40,
    height: 40,
  },
  resultIconImageCorrect: {
    width: 40,
    height: 40,
    tintColor: '#4CAF50',
  },
  resultIconImageWrong: {
    width: 40,
    height: 40,
    tintColor: '#F44336',
  },
  resultText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  resultTextCorrect: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    fontFamily: 'Epilogue, sans-serif',
  },
  resultTextWrong: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F44336',
    fontFamily: 'Epilogue, sans-serif',
  },
  flashcard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  flashcardImage: {
    width: '100%',
    aspectRatio: 1.8,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
  },
  flashcardContent: {
    gap: 12,
  },
  flashcardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flashcardWord: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  flashcardPronunciation: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
  flashcardMeaning: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  wrongAnswerBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  wrongAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  wrongAnswerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#F44336',
    fontFamily: 'Epilogue, sans-serif',
  },
  nextButton: {
    width: '100%',
    maxWidth: 500,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  nextButtonHover: {
    backgroundColor: '#43A047',
    transform: 'translateY(-2px)',
    shadowOpacity: 0.4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  summaryContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    flex: 1,
    gap: 24,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    justifyContent: 'center',
  },
  statItem: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  failedListSection: {
    width: '100%',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  failedList: {
    width: '100%',
    gap: 10,
  },
  failedItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  failedItemInfo: {
    flex: 1,
    gap: 2,
  },
  failedItemWord: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  failedItemMeaning: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  audioButtonSmallest: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  closeButtonHover: {
    backgroundColor: '#FFEBEE',
  },
  closeButtonIcon: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  closeButtonIconHover: {
    color: '#F44336',
  },
})
