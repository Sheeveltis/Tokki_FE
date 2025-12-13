import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../../assets/icon/icon-mainflow/star.svg'
import { FlipCard } from 'components/FlipCard'
import { normalizeImageSource } from '../../../../api'
import { studyStyles } from '../../../../styles'
import { ALPHABET_LETTERS } from '../../../../mockData'
import { ProgressBar, PronunciationDisplay, LearnedButton } from '../index'
import { PaginationControls } from '../../alphabet-typing'

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
  onBackPress,
  onFlip,
  onToggleFavorite,
  onMarkAsLearned,
  onNext,
  onPrev,
}) {
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

      {/* Pronunciation */}
      <PronunciationDisplay pronunciation={current.pronunciation} />

      {/* Action Buttons */}
      <LearnedButton isLearned={isLearned} onPress={onMarkAsLearned} />

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
    height: 524, // 500 + 12*2 (border)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
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

