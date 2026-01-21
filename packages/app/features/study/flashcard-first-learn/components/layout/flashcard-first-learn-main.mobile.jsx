import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '../../../api'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'
import { FlipCard } from 'components/FlipCard'
import SoundIcon from '../../../../../../assets/icon/icon-mainflow/sound.svg'

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
}) {
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
                  <Image
                    source={normalizeImageSource(current.imageUrl)}
                    style={styles.flipImage}
                    resizeMode="cover"
                  />
                ) : null}
                <Text style={styles.flipMeaning}>{current.meaning || ''}</Text>
              </View>
            }
            width="100%"
            height={500}
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
                <Image
                  source={normalizeImageSource(SoundIcon)}
                  style={styles.audioIcon}
                  resizeMode="contain"
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

    return (
      <View
        style={[
          styles.resultBox,
          isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
        ]}
      >
        <View style={[styles.resultBadge, isCorrect ? styles.resultCorrect : styles.resultWrong]} />
        {current.imageUrl ? (
          <Image source={normalizeImageSource(current.imageUrl)} style={styles.cardImage} resizeMode="cover" />
        ) : null}
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            <TouchableOpacity style={styles.audioButtonSmall} onPress={onPlaySound}>
              <Image
                source={normalizeImageSource(SoundIcon)}
                style={styles.audioIconSmall}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={[styles.cardWord, styles.resultTextOnColor]}>
              {current.word}
            </Text>
          </View>
          {current.pronunciation ? (
            <Text style={[styles.cardPronun, styles.resultTextOnColor]}>
              {current.pronunciation}
            </Text>
          ) : null}
          <Text style={[styles.cardMeaning, styles.resultTextOnColor]}>
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
      <>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  if (!current) {
    return (
      <>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có từ vựng nào</Text>
        </View>
      </>
    )
  }

  return (
    <>
      <View style={styles.headerTop}>
        <NavigationPill
          label="Quay lại"
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

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
    </>
  )
}

const styles = StyleSheet.create({
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleRow: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...studyStyles.pageTitle,
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#833ab4',
    // Gradient sẽ áp dụng trên web, native sẽ fallback màu đầu tiên
    backgroundImage: 'linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)',
    borderRadius: 999,
  },
  flipCardWrapper: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  flipFront: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  flipWord: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  flipPronun: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  flipBack: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
  },
  flipImage: {
    width: '100%',
    height: 260,
    borderRadius: 8,
  },
  flipMeaning: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardBox: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  cardImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#F5F5F5' },
  cardWord: { fontSize: 24, fontWeight: '800', color: '#1F1F1F', textTransform: 'capitalize' },
  cardPronun: { fontSize: 15, color: '#666', fontStyle: 'italic' },
  cardMeaning: { fontSize: 16, color: '#1F1F1F', textAlign: 'center' },
  cardHint: { fontSize: 12, color: '#777' },
  practiceBox: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#1F1F1F' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIcon: {
    width: 32,
    height: 32,
    tintColor: '#1F1F1F',
  },
  meaningBox: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  meaningText: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#1F1F1F' },
  answerInput: {
    width: '100%',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    fontSize: 15,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1BE4B',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '800', color: '#1F1F1F' },
  resultBox: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 16,
  },
  resultBoxCorrect: { backgroundColor: '#23ac38' },
  resultBoxWrong: { backgroundColor: '#eb5757' },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resultCorrect: { backgroundColor: '#23ac38' },
  resultWrong: { backgroundColor: '#eb5757' },
  resultBadgeText: { fontSize: 14, fontWeight: '800', color: '#1F1F1F' },
  resultContent: { width: '100%', gap: 6, alignItems: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrongBox: {
    width: '100%',
    marginTop: 6,
    padding: 10,
    backgroundColor: '#ffffff33',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff66',
  },
  wrongLabel: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  wrongText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  nextButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  audioButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconSmall: {
    width: 24,
    height: 24,
    tintColor: '#1F1F1F',
  },
  resultTextOnColor: {
    color: '#FFFFFF',
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  errorText: { fontSize: 16, color: '#C62828', textAlign: 'center' },
  retryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1BE4B' },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
})


