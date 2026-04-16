import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Animated, Platform } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import CorrectIcon from 'assets/icon/icon-mainflow/correct.svg'
import RandomIcon from 'assets/icon/icon-mainflow/random.svg'
import IncorrectImage from 'assets/incorrect.png'
import { FlashcardActionButton, FlashcardVocabularyList } from '@tokki/app/features/study/components/shared'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import { StudyActionButtons } from '@tokki/app/features/alphabet/api/alphabet-learn-index'
import { PaginationControls, InstructionsBox } from '@tokki/app/features/alphabet/api/alphabet-typing-index'
import { colors } from '@tokki/app/color'

/**
 * FlashcardLearnMain (Web): Nội dung chính của trang học flashcard trên web
 */
export function FlashcardLearnMain({
  title,
  current,
  currentIndex,
  total,
  unlearnedCount,
  isFlipped,
  isFavorite,
  isLearned,
  progress,
  learnedCount,
  slideDirection,
  showInstructions,
  loading,
  error,
  flashcards,
  onBackPress,
  onFlip,
  onToggleFavorite,
  onMarkAsLearned,
  onMarkAsNeedReview,
  onNext,
  onPrev,
  onToggleInstructions,
  onRetry,
  onShuffle,
  isShuffled,
}) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const audioRef = useRef(null)

  // Hàm phát âm thanh từ audioUrl
  const handlePlaySound = () => {
    if (!current?.audioUrl) {
      return
    }

    // Dừng âm thanh cũ nếu đang phát
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Tạo audio element mới và phát
    const audio = new Audio(current.audioUrl)
    audioRef.current = audio
    
    audio.play().catch((error) => {
      console.error('Error playing audio:', error)
    })

    // Cleanup khi audio kết thúc
    audio.addEventListener('ended', () => {
      audioRef.current = null
    })
  }

  // Cleanup audio khi component unmount hoặc current thay đổi
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [current])

  useEffect(() => {
    if (slideDirection) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: slideDirection === 'left' ? -1 : 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        slideAnim.setValue(0)
        opacityAnim.setValue(1)
      })
    }
  }, [slideDirection, slideAnim, opacityAnim])

  // Xử lý phím Space để flip card
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        onFlip(!isFlipped)
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isFlipped, onFlip])

  const cardAnimatedStyle = {
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-1000, 0, 1000],
        }),
      },
    ],
    opacity: opacityAnim,
  }
  // Render loading state
  if (loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải từ vựng..."
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  // Render error state
  if (error && flashcards.length === 0) {
    return (
      <>
        <View style={styles.header}>
          <NavigationPill
            label="Trở lại"
            to={undefined}
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </>
    )
  }

  // Render empty state
  if (flashcards.length === 0) {
    return (
      <>
        <View style={styles.header}>
          <NavigationPill
            label="Trở lại"
            to={undefined}
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

  // Render completion state - tất cả card đã học xong
  if (unlearnedCount === 0 && flashcards.length > 0) {
    return (
      <>
        <View style={styles.header}>
          <NavigationPill
            label="Trở lại"
            to={undefined}
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chúc mừng! Bạn đã hoàn thành tất cả từ vựng!</Text>
        </View>
      </>
    )
  }

  return (
    <>
      <View style={styles.statsRow}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Đã hoàn thành <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{learnedCount} / {total}</Text> từ vựng ({progress}%)
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isShuffled && styles.iconButtonActive
            ]}
            onPress={onShuffle}
          >
            <StudyIcon
              source={RandomIcon}
              width={18}
              height={18}
              tintColor={isShuffled ? '#FFF' : '#1A1A1A'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={onToggleInstructions}
          >
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        {slideDirection ? (
          <View style={styles.slideWrapper}>
            <Animated.View 
              style={[
                styles.cardWrapper,
                cardAnimatedStyle,
              ]}
            >
              <FlipCard
                word={current.word || ''}
                meaning={current.meaning || ''}
                image={current.imageUrl || undefined}
                width="100%"
                height={500}
                frontColor={colors.primary}
                backColor={colors.primary}
                borderWidth={12}
                borderRadius={12}
                flipOnHover={false}
                isFlipped={isFlipped}
                onFlip={onFlip}
                starIcon={normalizeImageSource(StarIcon)}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
              />
            </Animated.View>
          </View>
        ) : (
          <View style={styles.cardWrapper}>
            <FlipCard
              word={current.word || ''}
              meaning={current.meaning || ''}
              image={current.imageUrl || undefined}
              width="100%"
              height={500}
              frontColor={colors.primaryLight}
              backColor={colors.primaryLight}
              borderWidth={12}
              borderRadius={12}
              flipOnHover={false}
              isFlipped={isFlipped}
              onFlip={onFlip}
              starIcon={normalizeImageSource(StarIcon)}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
            />
          </View>
        )}
      </View>

      {/* Action Buttons with Status Badge */}
      <View style={styles.actionsContainer}>
        <StudyActionButtons 
          onMarkAsNeedReview={onMarkAsNeedReview}
          onMarkAsLearned={onMarkAsLearned}
        />
        {/* Status Badge - nằm giữa 2 nút */}
        <View style={styles.statusBadge}>
          {isLearned ? (
            <StudyIcon
              source={CorrectIcon}
              width={32}
              height={32}
              tintColor={colors.correct}
            />
          ) : (
            <StudyIcon
              source={IncorrectImage}
              width={32}
              height={32}
            />
          )}
        </View>
      </View>

      {/* Pagination */}
      <PaginationControls
        currentIndex={currentIndex}
        total={unlearnedCount}
        onPrev={onPrev}
        onNext={onNext}
      />
      
      {/* Instructions - Hiển thị khi click vào icon dấu chấm hỏi */}
      {showInstructions && (
        <View style={styles.instructionsContainer}>
          <InstructionsBox
            instructions={`1. Click vào card để xem nghĩa và cách phát âm\n2. Nhấn phím Space để lật card\n3. Sử dụng nút "Cần học lại" hoặc "Đã học" để đánh dấu\n4. Sử dụng mũi tên trái/phải để chuyển card và đánh dấu`}
          />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  progressSection: {
    flex: 1,
    gap: 10,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#F0F0F0',
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  iconButtonActive: {
    backgroundColor: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  helpIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionsContainer: {
    width: '100%',
    maxWidth: 400,
    position: 'absolute',
    top: 60,
    right: 4,
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    }),
  },
  cardContainer: {
    width: '100%',
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  slideWrapper: {
    width: '100%',
    maxWidth: 800,
    height: 500,
    overflow: 'hidden',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 800,
    height: 500,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  statusBadge: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(241,190,75,0.2)',
    }),
  },
  retryButtonText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

