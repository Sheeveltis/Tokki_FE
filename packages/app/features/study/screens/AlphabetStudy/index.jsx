'use client'

import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Navbar } from 'components/navbar'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../components/flashcard'
import { FlipCard } from 'components/FlipCard'
import BunnyStudy from '../../../../../assets/bunny/14.png'
import BunnyTest from '../../../../../assets/bunny/15.png'
import Bunny13 from '../../../../../assets/bunny/13.png'
import Bunny12 from '../../../../../assets/bunny/12.png'
import { ALPHABET_LETTERS } from '../../mockData'

/**
 * @typedef {'letters' | 'syllables'} AlphabetMode
 */
import { normalizeImageSource } from '../../api'
import { studyStyles } from '../../styles'
import { PaginationControls } from '../../components/alphabet/alphabet-typing'

export function AlphabetStudyScreen({
  mode = 'letters', // 'letters' hoặc 'syllables'
  onBackPress,
  onLearnPress,
  onPronunciationPress,
  onTypingPress,
  onTestPress,
}) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())

  // TODO: Thay đổi data source dựa trên mode
  const data = mode === 'letters' ? ALPHABET_LETTERS : ALPHABET_LETTERS // Tạm thời dùng ALPHABET_LETTERS cho cả 2
  const current = data[index % data.length] || {}
  const isFavorite = favorites.has(index)
  
  const modeTitle = mode === 'letters' ? 'Học Chữ Cái' : 'Học Ghép Âm'

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % data.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  const handleSelectLetter = (newIndex) => {
    setIsFlipped(false)
    setIndex(newIndex)
  }

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <View style={styles.root}>
      <Navbar />

      <View style={styles.contentWrapper}>
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
            icon={BunnyStudy}
            title="Học"
            onPress={onLearnPress}
          />
          <FlashcardActionButton
            icon={Bunny13}
            title="Tập phát âm"
            onPress={onPronunciationPress}
          />
          <FlashcardActionButton
            icon={Bunny12}
            title="Tập đánh chữ"
            onPress={onTypingPress}
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
            onFlip={(flipped) => setIsFlipped(flipped)}
            starIcon={normalizeImageSource(StarIcon)}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </View>

        {/* Pagination */}
        <PaginationControls
          currentIndex={index}
          total={data.length}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {/* Letters/Syllables List */}
        <FlashcardVocabularyList
          flashcards={data}
          currentIndex={index}
          favorites={favorites}
          onSelectFlashcard={handleSelectLetter}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    paddingVertical: 16,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    gap: 20,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
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
    height: 524, // 500 + 12*2 (border)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default AlphabetStudyScreen

