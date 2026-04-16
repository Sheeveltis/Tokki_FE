import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity, Image } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import CorrectIcon from '../../../../../assets/icon/icon-mainflow/correct.svg'
import IncorrectImage from '../../../../../assets/incorrect.png'
import { FlipCard } from '../../../../../components/FlipCard'
import { normalizeImageSource } from '../../../study/api'
import { studyStyles } from '../../../study/styles'
import { ALPHABET_LETTERS } from '../../../study/mockData'
import { ProgressBar, StudyActionButtons } from '../../api/alphabet-learn-index'
import { PaginationControls, InstructionsBox } from '../../api/alphabet-typing-index'
import { colors } from '../../../../color'

/**
 * AlphabetLearnMain (Web): Nội dung chính của trang học chữ cái Hàn Quốc trên web
 */
export function AlphabetLearnMain({
  current,
  currentIndex,
  isFlipped,
  isFavorite,
  isLearned,
  progress,
  learnedCount,
  total,
  unlearnedCount,
  slideDirection,
  showInstructions,
  onBackPress,
  onFlip,
  onToggleFavorite,
  onMarkAsLearned,
  onMarkAsNeedReview,
  onNext,
  onPrev,
  onToggleInstructions,
}) {
  const slideAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (slideDirection) {
      // Bắt đầu animation
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
        // Reset sau khi animation hoàn thành
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

  if (ALPHABET_LETTERS.length === 0) {
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
          <Text style={styles.emptyText}>Chưa có chữ cái nào</Text>
        </View>
      </>
    )
  }

  // Render completion state - tất cả card đã học xong
  if (unlearnedCount === 0 && ALPHABET_LETTERS.length > 0) {
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
          <Text style={styles.emptyText}>Chúc mừng! Bạn đã hoàn thành tất cả chữ cái!</Text>
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
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        {/* Help Icon */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={onToggleInstructions}
        >
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Ôn Tập Chữ Cái</Text>

      {/* Progress Bar */}
      <ProgressBar
        learned={learnedCount}
        total={total}
        progress={progress}
      />

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
                width="100%"
                height={500}
                borderWidth={12}
                borderRadius={12}
                flipOnHover={false}
                isFlipped={isFlipped}
                onFlip={onFlip}
                starIcon={normalizeImageSource(StarIcon)}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            </Animated.View>
          </View>
        ) : (
          <View style={styles.cardWrapper}>
            <FlipCard
              word={current.word || ''}
              meaning={current.meaning || ''}
              width="100%"
              height={500}
              frontColor="#79964E"
              backColor="#79964E"
              borderWidth={12}
              borderRadius={12}
              flipOnHover={false}
              isFlipped={isFlipped}
              onFlip={onFlip}
              starIcon={normalizeImageSource(StarIcon)}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
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
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyContainer: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
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
})

