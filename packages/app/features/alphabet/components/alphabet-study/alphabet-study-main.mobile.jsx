import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../../study/components/shared'
import { FlipCard } from '../../../../../components/FlipCard'
import { normalizeImageSource } from '../../../study/api'
import { studyStyles } from '../../../study/styles'
import { PaginationControls } from '../../api/alphabet-typing-index'

/**
 * AlphabetStudyMain (Mobile): Nội dung chính của trang học chữ cái Hàn Quốc trên mobile
 */
export function AlphabetStudyMainMobile({
  modeTitle,
  current,
  currentIndex,
  isFlipped,
  isFavorite,
  data,
  favorites,
  onBackPress,
  onLearnPress,
  onPronunciationPress,
  onTypingPress,
  onDrawingPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onSelectFlashcard,
  onPrev,
  onNext,
}) {
  return (
    <>
      {/* Header with back and title */}
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
      <View>
        <Text style={styles.title}>{modeTitle}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <FlashcardActionButton
          title="Học"
          onPress={onLearnPress}
        />
        <FlashcardActionButton
          title="Tập phát âm"
          onPress={onPronunciationPress}
        />
        <FlashcardActionButton
          title="Tập đánh chữ"
          onPress={onTypingPress}
        />
        <FlashcardActionButton
          title="Vẽ chữ"
          onPress={onDrawingPress}
        />
        <FlashcardActionButton
          title="Kiểm tra"
          onPress={onTestPress}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <FlipCard
          word={current.word || ''}
          meaning={current.meaning || ''}
          width="100%"
          height={400}
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

      {/* Pagination */}
      <PaginationControls
        currentIndex={currentIndex}
        total={data.length}
        onPrev={onPrev}
        onNext={onNext}
      />

      {/* Letters/Syllables List */}
      <FlashcardVocabularyList
        flashcards={data}
        currentIndex={currentIndex}
        favorites={favorites}
        onSelectFlashcard={onSelectFlashcard}
      />
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
  title: {
    ...studyStyles.pageTitle,
    flex: 1,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

