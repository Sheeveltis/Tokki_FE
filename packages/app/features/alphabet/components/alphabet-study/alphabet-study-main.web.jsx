import React, { useState } from 'react'
import { View, Text, StyleSheet, Platform, Image } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import LearnIcon from '../../../../../assets/icon/icon-mainflow/read.svg'
import PronunciationIcon from '../../../../../assets/icon/icon-mainflow/micro.svg'
import TypingIcon from '../../../../../assets/icon/icon-mainflow/write.svg'
import DrawingIcon from '../../../../../assets/icon/icon-mainflow/bulb.svg'
import TestIcon from '../../../../../assets/icon/icon-mainflow/game.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../../study/components/shared'
import { FlipCard } from '../../../../../components/FlipCard'
import { normalizeImageSource } from '../../../study/api'
import { studyStyles } from '../../../study/styles'
import { StudyIcon } from '../../../study/components/study-icon.web'
import { PaginationControls } from '../../api/alphabet-typing-index'

/**
 * AlphabetStudyMain (Web): Nội dung chính của trang học chữ cái Hàn Quốc trên web
 */
export function AlphabetStudyMain({
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
    <View style={styles.container}>
      {/* Header with back and title */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        <Text style={styles.title}>{modeTitle}</Text>
        <View style={{ width: 100 }} /> {/* Spacer */}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <FlashcardActionButton
          title="Học"
          icon={LearnIcon}
          onPress={onLearnPress}
        />
        <FlashcardActionButton
          title="Tập phát âm"
          icon={PronunciationIcon}
          onPress={onPronunciationPress}
        />
        <FlashcardActionButton
          title="Tập đánh chữ"
          icon={TypingIcon}
          onPress={onTypingPress}
        />
        <FlashcardActionButton
          title="Vẽ chữ"
          icon={DrawingIcon}
          onPress={onDrawingPress}
        />
        <FlashcardActionButton
          title="Kiểm tra"
          icon={TestIcon}
          onPress={onTestPress}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <FlipCard
          word={current.word || ''}
          meaning={current.meaning || ''}
          width="100%"
          maxWidth={600}
          height={400}
          frontColor="#79964E"
          backColor="#79964E"
          borderWidth={12}
          borderRadius={24}
          flipOnHover={false}
          isFlipped={isFlipped}
          onFlip={onFlip}
          starIcon={normalizeImageSource(StarIcon)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </View>

      {/* Pagination */}
      <View style={styles.paginationWrapper}>
        <PaginationControls
          currentIndex={currentIndex}
          total={data.length}
          onPrev={onPrev}
          onNext={onNext}
        />
      </View>

      {/* Letters/Syllables List */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Danh sách từ vựng</Text>
        <FlashcardVocabularyList
          flashcards={data}
          currentIndex={currentIndex}
          favorites={favorites}
          onSelectFlashcard={onSelectFlashcard}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 32,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  paginationWrapper: {
    alignItems: 'center',
  },
  listSection: {
    gap: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.7,
  },
})

