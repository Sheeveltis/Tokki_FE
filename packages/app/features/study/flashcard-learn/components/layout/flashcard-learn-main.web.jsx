import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, TouchableOpacity, Animated, Platform } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../assets/icon/icon-mainflow/star.svg'
import CorrectIcon from '../../../../../../assets/icon/icon-mainflow/correct.svg'
import RandomIcon from '../../../../../../assets/icon/icon-mainflow/random.svg'
import IncorrectImage from '../../../../../../assets/incorrect.png'
import { FlipCard } from 'components/FlipCard'
import { normalizeImageSource } from '../../../api'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'
import { StudyActionButtons } from '../../../../alphabet/api/alphabet-learn-index'
import { PaginationControls, InstructionsBox } from '../../../../alphabet/api/alphabet-typing-index'
import { colors } from '../../../../../color'

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
      {/* Header */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        {/* Random and Help Icons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isShuffled && styles.iconButtonActive
            ]}
            onPress={onShuffle}
          >
            <Image
              source={normalizeImageSource(RandomIcon)}
              style={styles.iconImage}
              resizeMode="contain"
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

      <Text style={styles.title}>{title}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {learnedCount} / {total} từ đã học ({progress}%)
        </Text>
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
            <Image
              source={normalizeImageSource(CorrectIcon)}
              style={[styles.statusIcon, { tintColor: colors.correct }]}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={normalizeImageSource(IncorrectImage)}
              style={[styles.statusIcon, { tintColor: colors.wrong }]}
              resizeMode="contain"
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
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  iconButtonActive: {
    backgroundColor: '#79964E', // Màu xanh lá khi đang random
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: colors.neutralBlack,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  helpIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutralBlack,
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionsContainer: {
    width: '100%',
    maxWidth: 500,
    position: 'absolute',
    top: 80,
    right: 24,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    ...studyStyles.pageTitle,
  },
  progressContainer: {
    width: '100%',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#79964E',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardContainer: {
    width: '100%',
    minHeight: 500,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  slideWrapper: {
    width: '100%',
    height: 500,
    overflow: 'hidden',
  },
  cardWrapper: {
    width: '100%',
    height: 500,
    position: 'relative',
  },
  actionsContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    width: 32,
    height: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

