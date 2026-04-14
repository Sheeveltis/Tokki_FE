import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Platform, Modal, Image as RNImage, Animated } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import CorrectIcon from 'assets/icon/icon-mainflow/correct.svg'
import WarnIcon from 'assets/icon/icon-mainflow/warn.svg'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import { FlipCard } from 'components/FlipCard'
import CorrectSfx from 'assets/sound-effect/correct.wav'
import WrongSfx from 'assets/sound-effect/wrong.wav'
import DoneSfx from 'assets/sound-effect/done.wav'

export function FlashcardFirstLearnMain({
  title,
  current,
  currentIndex,
  total,
  currentStepKey,
  isFlipped,
  loading,
  error,
  userAnswer,
  showResult,
  isCorrect,
  setUserAnswer,
  onFlip,
  onSubmit,
  onContinue,
  canContinue,
  onBackPress,
  onRetry,
  onPlaySound,
  progress,
  isTopicCompleted,
  showContinueDialog,
  hasMoreFlashcards,
  allWordsCompleted,
  onContinueLearning,
  onStopLearning,
  completedInBatch = 0,
  batchSize = 5,
}) {
  // Phím tắt Enter để tiếp tục (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyDown = (event) => {
      if (event.key !== 'Enter') return

      // Bước 1: chỉ cho phép Enter khi đã flip ít nhất 1 lần (thông qua canContinue)
      if (currentStepKey === 'view') {
        if (!canContinue) return
        event.preventDefault()
        onContinue?.()
        return
      }

      // Bước 2 & 3: chỉ tiếp tục sau khi đã bấm Kiểm tra (showResult = true)
      if (showResult) {
        event.preventDefault()
        onContinue?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStepKey, canContinue, showResult, onContinue])

  // SFX đúng/sai sau khi bấm "Kiểm tra" (chỉ bước 2 & 3, web only)
  const lastSfxKeyRef = useRef('')
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!showResult) return
    if (currentStepKey !== 'listen' && currentStepKey !== 'meaning') return

    const vocabId = current?.id || ''
    const sfxKey = `${vocabId}:${currentStepKey}:${isCorrect ? 'correct' : 'wrong'}`
    if (lastSfxKeyRef.current === sfxKey) return
    lastSfxKeyRef.current = sfxKey

    try {
      const src = isCorrect ? CorrectSfx : WrongSfx
      const audio = new Audio(src)
      audio.volume = 1
      audio.play().catch(() => { })
    } catch (e) {
      // ignore
    }
  }, [showResult, currentStepKey, isCorrect, current?.id])

  // SFX "done" khi hoàn thành toàn bộ topic (web only)
  const doneSfxPlayedRef = useRef(false)
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (!isTopicCompleted) return
    if (doneSfxPlayedRef.current) return

    doneSfxPlayedRef.current = true
    try {
      const audio = new Audio(DoneSfx)
      audio.volume = 1
      audio.play().catch(() => { })
    } catch (e) {
      // ignore
    }
  }, [isTopicCompleted])
  
  const iconScale = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (showResult) {
      iconScale.setValue(0)
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: false,
        friction: 4,
        tension: 40,
      }).start()
    }
  }, [showResult])

  const renderStep = () => {
    if (!current) return null
    if (currentStepKey === 'view') {
      return (
        <View style={styles.flipCardWrapper}>
          <FlipCard
            frontContent={
              <View style={styles.flipFront}>
                <Text style={styles.flipWord}>{current.word || ''}</Text>
                {current.pronunciation ? (
                  <Text style={styles.flipPronun}>{current.pronunciation}</Text>
                ) : null}
              </View>
            }
            backContent={
              <View style={styles.flipBack}>
                {current.imageUrl ? (
                  <RNImage
                    source={normalizeImageSource(current.imageUrl)}
                    style={styles.flipImage}
                    resizeMode="contain"
                  />
                ) : null}
                <Text style={styles.flipMeaning}>{current.meaning || ''}</Text>
              </View>
            }
            width="100%"
            height={Platform.OS === 'web' ? '60vh' : 500}
            frontColor="#79964E"
            backColor="#79964E"
            borderWidth={12}
            borderRadius={12}
            flipOnHover={false}
            isFlipped={isFlipped}
            onFlip={onFlip}
            onPlaySound={current?.audioUrl ? onPlaySound : undefined}
          />
          <Text style={styles.cardHint}>Bấm vào thẻ để lật, sau đó bấm Tiếp tục</Text>
        </View>
      )
    }

    if (!showResult) {
      return (
        <View style={styles.practiceBox}>
          <Text style={styles.stepTitle}>
            {currentStepKey === 'listen' ? 'Nghe và viết lại' : 'Nhìn nghĩa và viết từ'}
          </Text>
          {currentStepKey === 'listen' ? (
            <View style={styles.audioRow}>
              <TouchableOpacity style={styles.audioButton} onPress={onPlaySound}>
                <StudyIcon
                  source={SoundIcon}
                  width={32}
                  height={32}
                  tintColor="#1F1F1F"
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.meaningBox}>
              <Text style={styles.meaningText}>{current.meaning}</Text>
            </View>
          )}

          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder={currentStepKey === 'listen' ? 'Gõ lại từ bạn nghe được' : 'Nhập từ tiếng Anh'}
            placeholderTextColor="#999"
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity
            style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={!userAnswer.trim()}
          >
            <Text style={styles.submitText}>Kiểm tra</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // Result view
    return (
      <View
        style={[
          styles.resultBox,
          isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
        ]}
      >
        <Animated.View style={[styles.resultIconWrapper, { transform: [{ scale: iconScale }] }]}>
          <StudyIcon
            source={isCorrect ? CorrectIcon : WarnIcon}
            width={64}
            height={64}
            tintColor={isCorrect ? '#2FB96B' : '#CF4B4B'}
          />
        </Animated.View>

        {current.imageUrl ? (
          <RNImage source={normalizeImageSource(current.imageUrl)} style={styles.cardImage} resizeMode="cover" />
        ) : null}
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <TouchableOpacity style={styles.audioButtonSmall} onPress={onPlaySound}>
              <StudyIcon
                source={SoundIcon}
                width={20}
                height={20}
                tintColor="#FFFFFF"
              />
            </TouchableOpacity>
            <Text style={styles.cardWord}>
              {current.word}
            </Text>
          </View>
          {current.pronunciation ? (
            <Text style={styles.cardPronun}>
              {current.pronunciation}
            </Text>
          ) : null}
          <Text style={styles.cardMeaning}>
            {current.meaning}
          </Text>
          {!isCorrect ? (
            <View style={styles.wrongBox}>
              <Text style={styles.wrongLabel}>Đáp án của bạn:</Text>
              <Text style={styles.wrongText}>{userAnswer}</Text>
            </View>
          ) : null}
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải từ vựng..."
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    )
  }

  if (error && (!current || total === 0)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!current) {
    // Hiển thị thông báo khi đã học hết từ vựng
    if (allWordsCompleted) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.completedText}>Bạn đã học hết từ vựng!</Text>
          <Text style={styles.completedSubtext}>Đang chuyển về danh sách từ vựng...</Text>
        </View>
      )
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có từ vựng nào</Text>
      </View>
    )
  }

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.statsRow}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Tiến độ hoàn thành: <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{progress}%</Text>
          </Text>
        </View>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.stepContainer}>
          {renderStep()}
        </View>

        {(currentStepKey === 'view' || showResult) && (
          <TouchableOpacity
            style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
            onPress={onContinue}
            disabled={!canContinue}
          >
            <Text style={styles.nextText}>
              {currentStepKey === 'meaning' && showResult && currentIndex + 1 === total ? 'Hoàn thành' : 'Tiếp tục'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dialog tiếp tục học */}
      {showContinueDialog && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {hasMoreFlashcards
                ? `Bạn đã học xong ${completedInBatch} từ!`
                : 'Bạn đã học hết từ vựng!'}
            </Text>
            <Text style={styles.modalMessage}>
              {hasMoreFlashcards
                ? 'Bạn có muốn tiếp tục học thêm từ vựng không?'
                : 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng trong chủ đề này.'}
            </Text>
            <View style={styles.modalButtons}>
              {hasMoreFlashcards && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={onContinueLearning}
                >
                  <Text style={styles.modalButtonText}>Tiếp tục học</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onStopLearning}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                  {hasMoreFlashcards ? 'Dừng lại' : 'Quay lại'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
    paddingTop: 20,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    width: '100%',
    maxWidth: '80vh',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  progressSection: {
    flex: 1,
    gap: 10,
  },
  progressBar: {
    width: '100%',
    height: 15,
    backgroundColor: '#afafafff',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 100,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  flipCardWrapper: {
    width: '100%',
    maxWidth: '80vh',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  flipFront: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  flipWord: {
    fontSize: 'min(5vw, 34px)',
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  flipPronun: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  flipBack: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  flipImage: {
    width: '100%',
    height: '100%',
    maxHeight: '40vh',
    borderRadius: 8,
  },
  flipMeaning: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardBox: {
    width: '100%',
    height: '50%',
    maxWidth: 720,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7EB',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  cardImage: {
    width: 320,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  cardWord: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F1F1F',
    textTransform: 'capitalize',
  },
  cardPronun: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  cardMeaning: {
    fontSize: 18,
    color: '#1F1F1F',
    textAlign: 'center',
  },
  cardHint: {
    fontSize: 13,
    color: '#777',
  },
  practiceBox: {
    width: '100%',
    maxWidth: 720,
    height: 'auto',
    minHeight: '50vh',
    maxHeight: '70vh',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  audioButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  audioIcon: {
    width: 32,
    height: 32,
    tintColor: '#1F1F1F',
  },
  meaningBox: {
    width: '100%',
    maxWidth: 520,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  meaningText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1F1F1F',
  },
  answerInput: {
    width: '100%',
    maxWidth: 520,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  resultBox: {
    width: '100%',
    maxWidth: 720,
    height: 'auto',
    minHeight: '50vh',
    maxHeight: '70vh',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
  },
  resultBoxCorrect: {
    borderColor: '#2FB96B',
  },
  resultBoxWrong: {
    borderColor: '#CF4B4B',
  },
  resultIconWrapper: {
    marginBottom: 10,
  },
  resultBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  resultCorrect: { backgroundColor: '#2FB96B' },
  resultWrong: { backgroundColor: '#CF4B4B' },
  resultBadgeText: { fontSize: 15, fontWeight: '800', color: '#1F1F1F' },
  resultContent: { width: '100%', gap: 6, alignItems: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrongBox: {
    width: '100%',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CF4B4B',
  },
  wrongLabel: { fontSize: 13, fontWeight: '700', color: '#CF4B4B' },
  wrongText: { fontSize: 16, fontWeight: '700', color: '#CF4B4B' },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTextOnColor: {
    color: '#FFFFFF',
  },
  nextButton: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  nextButtonDisabled: {
    opacity: 0.6,
    ...(Platform.OS === 'web' && { cursor: 'not-allowed' }),
  },
  nextText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  audioButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  audioIconSmall: {
    width: 24,
    height: 24,
    tintColor: '#1F1F1F',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  errorText: { fontSize: 16, color: '#C62828', textAlign: 'center' },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1BE4B',
  },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
  completedText: { fontSize: 24, fontWeight: '800', color: '#4CAF50', marginBottom: 12 },
  completedSubtext: { fontSize: 16, color: '#666' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    gap: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    }),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F1F1F',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Epilogue, sans-serif',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  modalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  modalButtonSecondary: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalButtonTextSecondary: {
    color: '#1F1F1F',
  },
})


