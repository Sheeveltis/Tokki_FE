import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Platform, Image, Animated } from 'react-native'
import { submitSpacedRepetition } from '@tokki/app/features/study/api'
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
export function LearnedVocabularyPracticeMode({
  vocabularies = [],
  onBack,
  onPracticeComplete,
}) {
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  
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
        finalQueue.push(...groupPasses[i-1].pass2)
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
    }

    submitAnswer(correct ? 2 : 0)
  }, [currentVocab, userAnswer, hasAnswered, playSoundEffect])

  // Submit kết quả
  const submitAnswer = useCallback(async (quality) => {
    if (!currentVocab || isSubmitting) return

    try {
      setIsSubmitting(true)
      await submitSpacedRepetition(currentVocab.id, quality)
    } catch (error) {
      console.error('Error submitting spaced repetition:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [currentVocab, isSubmitting])

  // Chuyển từ tiếp theo hoặc nhóm tiếp theo
  const handleNext = useCallback(() => {
    if (currentQueueIndex < practiceQueue.length - 1) {
      setCurrentQueueIndex((prev) => prev + 1)
    } else {
      // Hoàn thành tất cả
      onPracticeComplete?.()
    }
  }, [currentQueueIndex, practiceQueue.length, onPracticeComplete])

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

  if (!currentTask || !currentVocab) {
    return (
      <View style={styles.container}>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBack}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có từ vựng để học</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <NavigationPill
          label="Quay lại"
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBack}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>
          Tiến độ hoàn thành: <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{Math.round(progress)}%</Text>
        </Text>
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
                  <TouchableOpacity
                    style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim()}
                  >
                    <Text style={styles.submitButtonText}>Kiểm tra</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {currentMode === 'listen' && (
              <View style={styles.questionContainer}>
                <Text style={styles.instructionText}>Nghe và viết lại</Text>
                <View style={styles.audioButtonsContainer}>
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={handlePlaySound}
                  >
                    {renderSoundIcon(40)}
                  </TouchableOpacity>
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
                  <TouchableOpacity
                    style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
                    onPress={checkAnswer}
                    disabled={!userAnswer.trim()}
                  >
                    <Text style={styles.submitButtonText}>Kiểm tra</Text>
                  </TouchableOpacity>
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
                  <TouchableOpacity
                    style={styles.audioButtonSmall}
                    onPress={handlePlaySound}
                  >
                    {renderSoundIcon(24)}
                  </TouchableOpacity>
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

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentQueueIndex < practiceQueue.length - 1
                  ? 'Tiếp tục'
                  : 'Hoàn thành'}
              </Text>
            </TouchableOpacity>
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
    marginBottom: 16,
    paddingTop: 24,
  },
  progressContainer: {
    width: '100%',
    maxWidth: '80vh',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
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
    flex: 1,
  },
  questionContainer: {
    width: '100%',
    maxWidth: 600,
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
    }),
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
    }),
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
    }),
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
    maxWidth: 600,
    alignItems: 'center',
    gap: 20,
  },
  resultHeader: {
    alignItems: 'center',
    gap: 10,
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
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  flashcardImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
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
    }),
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
})
