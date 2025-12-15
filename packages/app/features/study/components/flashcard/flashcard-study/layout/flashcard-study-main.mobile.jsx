import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../index'
import { FlipCard } from 'components/FlipCard'
import BunnyStudy from '../../../../../../../assets/bunny/14.png'
import BunnyTest from '../../../../../../../assets/bunny/15.png'
import { FLASHCARDS } from '../../../../mockData'
import { normalizeImageSource } from '../../../../api'
import { studyStyles } from '../../../../styles'

/**
 * FlashcardStudyMain (Mobile): Nội dung chính của trang học flashcard trên mobile
 */
export function FlashcardStudyMain({
  title,
  current,
  currentIndex,
  total,
  isFlipped,
  isFavorite,
  favorites,
  onBackPress,
  onLearnPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onNext,
  onPrev,
  onSelectFlashcard,
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
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <FlashcardActionButton
          icon={BunnyStudy}
          title="Học"
          onPress={onLearnPress}
        />
        <FlashcardActionButton
          icon={BunnyTest}
          title="Kiểm tra"
          onPress={onTestPress}
        />
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <FlipCard
          word={current.word}
          meaning={current.meaning}
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

      {/* Pagination */}
      <View style={styles.pagination}>
        <Pressable style={styles.navBtn} onPress={onPrev}>
          <Image 
            source={normalizeImageSource(ArrowIcon)} 
            style={[styles.navIcon, { transform: [{ scaleX: -1 }] }]} 
            resizeMode="contain" 
          />
        </Pressable>
        <Text style={styles.pageText}>
          {currentIndex + 1} / {total}
        </Text>
        <Pressable style={styles.navBtn} onPress={onNext}>
          <Image 
            source={normalizeImageSource(ArrowIcon)} 
            style={styles.navIcon} 
            resizeMode="contain" 
          />
        </Pressable>
      </View>

      {/* Vocabulary List */}
      <FlashcardVocabularyList
        flashcards={FLASHCARDS}
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
  },
  cardContainer: {
    width: '100%',
    height: 524, // 500 + 12*2 (border)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  pageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

