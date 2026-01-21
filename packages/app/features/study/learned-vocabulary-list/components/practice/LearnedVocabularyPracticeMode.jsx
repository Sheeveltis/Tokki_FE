import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Platform, Image } from 'react-native'
import { submitSpacedRepetition } from '../../../api'
import { NavigationPill } from '../../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '../../../api'

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
  const inputRef = useRef(null)

  // Chia từ vựng thành các nhóm 5 từ
  const groups = useMemo(() => {
    const result = []
    for (let i = 0; i < vocabularies.length; i += GROUP_SIZE) {
      result.push(vocabularies.slice(i, i + GROUP_SIZE))
    }
    return result
  }, [vocabularies])

  // Tạo queue học tập: [group0-firstMode, group1-firstMode, group0-secondMode, group2-firstMode, group1-secondMode, ...]
  const practiceQueue = useMemo(() => {
    if (groups.length === 0) return []
    
    const queue = []
    const groupModes = {} // Track chế độ đã random cho mỗi nhóm: { groupIndex: 'meaning' | 'listen' }
    
    // Random chế độ cho mỗi nhóm lần đầu
    groups.forEach((group, groupIndex) => {
      const randomMode = Math.random() < 0.5 ? 'meaning' : 'listen'
      groupModes[groupIndex] = randomMode
    })

    // Tạo queue: nhóm đầu tiên học cả 2 chế độ, sau đó mỗi nhóm mới học 1 chế độ rồi quay lại nhóm trước
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i]
      const firstMode = groupModes[i]
      const secondMode = firstMode === 'meaning' ? 'listen' : 'meaning'
      
      // Lần đầu học nhóm này với chế độ random
      queue.push({
        groupIndex: i,
        vocabularies: group,
        mode: firstMode,
        isFirstPass: true,
      })
      
      // Nếu không phải nhóm đầu tiên, thêm nhóm trước học chế độ còn lại
      if (i > 0) {
        const prevGroupIndex = i - 1
        const prevFirstMode = groupModes[prevGroupIndex]
        const prevSecondMode = prevFirstMode === 'meaning' ? 'listen' : 'meaning'
        
        queue.push({
          groupIndex: prevGroupIndex,
          vocabularies: groups[prevGroupIndex],
          mode: prevSecondMode,
          isFirstPass: false,
        })
      }
    }
    
    // Thêm nhóm cuối học chế độ còn lại
    if (groups.length > 0) {
      const lastGroupIndex = groups.length - 1
      const lastFirstMode = groupModes[lastGroupIndex]
      const lastSecondMode = lastFirstMode === 'meaning' ? 'listen' : 'meaning'
      
      queue.push({
        groupIndex: lastGroupIndex,
        vocabularies: groups[lastGroupIndex],
        mode: lastSecondMode,
        isFirstPass: false,
      })
    }
    
    return queue
  }, [groups])

  // Lấy thông tin học tập hiện tại từ queue
  const currentPractice = practiceQueue[currentQueueIndex]
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [currentVocabIndex, setCurrentVocabIndex] = useState(0)
  
  const currentVocab = currentPractice?.vocabularies[currentVocabIndex]
  const currentMode = currentPractice?.mode || 'meaning'
  
  // Tính tổng số từ cần học (mỗi từ học 2 lần)
  const totalVocabCount = vocabularies.length * 2
  const completedCount = useMemo(() => {
    let count = 0
    for (let i = 0; i < currentQueueIndex; i++) {
      count += practiceQueue[i]?.vocabularies.length || 0
    }
    count += currentVocabIndex
    return count
  }, [currentQueueIndex, currentVocabIndex, practiceQueue])
  
  const progress = totalVocabCount > 0 ? (completedCount / totalVocabCount) * 100 : 0

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
  }, [currentVocabIndex, currentQueueIndex, currentMode])

  // Cập nhật groupIndex và vocabIndex khi queueIndex thay đổi
  useEffect(() => {
    if (currentPractice) {
      setCurrentGroupIndex(currentPractice.groupIndex)
      setCurrentVocabIndex(0)
    }
  }, [currentQueueIndex, currentPractice])

  // Phát âm thanh
  const handlePlaySound = useCallback(() => {
    if (!currentVocab?.audioUrl) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const audio = new Audio(currentVocab.audioUrl)
    audioRef.current = audio

    audio.play().catch((error) => {
      console.error('Error playing audio:', error)
    })

    audio.addEventListener('ended', () => {
      audioRef.current = null
    })
  }, [currentVocab])

  // Phát âm chậm
  const handlePlaySlowSound = useCallback(() => {
    if (!currentVocab?.audioUrl) return
    handlePlaySound()
  }, [currentVocab, handlePlaySound])

  // Kiểm tra đáp án
  const checkAnswer = useCallback(() => {
    if (!currentVocab || hasAnswered || !userAnswer.trim()) return

    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentVocab.word.trim().toLowerCase()
    const correct = normalizedUserAnswer === normalizedCorrectAnswer

    setIsCorrect(correct)
    setShowResult(true)
    setHasAnswered(true)

    submitAnswer(correct ? 2 : 0)
  }, [currentVocab, userAnswer, hasAnswered])

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
    if (!currentPractice) return

    // Kiểm tra xem còn từ nào trong nhóm hiện tại không
    if (currentVocabIndex < currentPractice.vocabularies.length - 1) {
      // Chuyển sang từ tiếp theo trong nhóm
      setCurrentVocabIndex((prev) => prev + 1)
    } else {
      // Hết từ trong nhóm, chuyển sang nhóm tiếp theo
      if (currentQueueIndex < practiceQueue.length - 1) {
        setCurrentQueueIndex((prev) => prev + 1)
      } else {
        // Hoàn thành tất cả
        onPracticeComplete?.()
      }
    }
  }, [currentVocabIndex, currentPractice, currentQueueIndex, practiceQueue.length, onPracticeComplete])

  // Xử lý Enter để submit
  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.key === 'Enter' && !hasAnswered) {
      checkAnswer()
    }
  }

  // Tự động phát âm khi vào chế độ listen
  useEffect(() => {
    if (currentMode === 'listen' && currentVocab?.audioUrl && !hasAnswered) {
      const timer = setTimeout(() => {
        handlePlaySound()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentMode, currentVocabIndex, currentQueueIndex, currentVocab, handlePlaySound, hasAnswered])

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  if (!currentPractice || !currentVocab) {
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
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completedCount} / {totalVocabCount}
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
                  onKeyPress={handleKeyPress}
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
                    <View style={styles.audioButtonIcon}>
                      <Text style={styles.audioButtonIconText}>🔊</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.audioButtonSmall}
                    onPress={handlePlaySlowSound}
                  >
                    <Text style={styles.snailIcon}>🐌</Text>
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
                  onKeyPress={handleKeyPress}
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
                  <Text style={styles.resultIcon}>✓</Text>
                  <Text style={styles.resultText}>Đúng rồi!</Text>
                </View>
              ) : (
                <View style={styles.resultWrong}>
                  <Text style={styles.resultIcon}>✗</Text>
                  <Text style={styles.resultText}>Sai rồi!</Text>
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
                    <Text style={styles.audioButtonIconText}>🔊</Text>
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
                {currentVocabIndex < currentPractice.vocabularies.length - 1 || currentQueueIndex < practiceQueue.length - 1
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
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  practiceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  questionContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    gap: 24,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  meaningBox: {
    width: '100%',
    maxWidth: 500,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  meaningText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  audioButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  audioButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
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
  audioButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioButtonIconText: {
    fontSize: 24,
  },
  snailIcon: {
    fontSize: 24,
  },
  answerInput: {
    width: '100%',
    maxWidth: 500,
    height: 60,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    fontSize: 20,
    fontWeight: '500',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
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
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
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
    gap: 24,
  },
  resultHeader: {
    alignItems: 'center',
    gap: 8,
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
    fontSize: 48,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  flashcard: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    gap: 16,
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
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})
