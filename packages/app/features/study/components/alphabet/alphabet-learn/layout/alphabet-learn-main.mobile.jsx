import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../../assets/icon/icon-mainflow/star.svg'
import { FlipCard } from 'components/FlipCard'
import { normalizeImageSource } from '../../../../api'
import { studyStyles } from '../../../../styles'
import { ALPHABET_LETTERS } from '../../../../mockData'
import { ProgressBar, PronunciationDisplay, StudyActionButtons } from '../index'
import { PaginationControls } from '../../alphabet-typing'

/**
 * AlphabetLearnMain (Mobile): Nội dung chính của trang học chữ cái Hàn Quốc trên mobile
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
  slideDirection,
  onBackPress,
  onFlip,
  onToggleFavorite,
  onMarkAsLearned,
  onMarkAsNeedReview,
  onNext,
  onPrev,
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
        </Animated.View>
      </View>

      {/* Pronunciation */}
      <PronunciationDisplay pronunciation={current.pronunciation} />

      {/* Action Buttons */}
      <StudyActionButtons 
        onMarkAsNeedReview={onMarkAsNeedReview}
        onMarkAsLearned={onMarkAsLearned}
      />

      {/* Pagination */}
      <PaginationControls
        currentIndex={currentIndex}
        total={ALPHABET_LETTERS.length}
        onPrev={onPrev}
        onNext={onNext}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    ...studyStyles.pageTitle,
  },
  cardContainer: {
    width: '100%',
    height: '40%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
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

