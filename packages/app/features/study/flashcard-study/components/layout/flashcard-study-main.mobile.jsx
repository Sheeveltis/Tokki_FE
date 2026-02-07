import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { NavigationPill } from '../../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../../components/shared'
import { FlipCard } from '../../../../../../components/FlipCard'
import BunnyStudy from '../../../../../../assets/bunny/14.png'
import BunnyTest from '../../../../../../assets/bunny/15.png'
import { normalizeImageSource } from '../../../api'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'

/**
 * FlashcardStudyMain (Mobile): Nội dung chính của trang học flashcard trên mobile
 */
export function FlashcardStudyMain({
  title,
  flashcards,
  current,
  currentIndex,
  total,
  isFlipped,
  isFavorite,
  favorites,
  onBackPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onNext,
  onPrev,
  onSelectFlashcard,
  loading,
  error,
  onRetry,
}) {
  if (loading) {
    return (
      <LoadingWithContainer
        size={40}
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

  if (error && (!flashcards || flashcards.length === 0)) {
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
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.resetButton} onPress={onRetry}>
            <Text style={styles.resetButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </>
    )
  }

  if (!flashcards || flashcards.length === 0) {
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
        {onTestPress && (
          <Pressable style={styles.reviewButton} onPress={onTestPress}>
            <Image
              source={normalizeImageSource(BunnyTest)}
              style={styles.reviewIcon}
              resizeMode="contain"
            />
            <Text style={styles.reviewButtonText}>Ôn tập</Text>
          </Pressable>
        )}
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <FlipCard
          word={current.word}
          meaning={current.meaning}
          image={current.imageUrl || undefined}
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
        flashcards={flashcards}
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
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  reviewIcon: {
    width: 20,
    height: 20,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  title: {
    ...studyStyles.pageTitle,
    flex: 1,
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
  resetButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#79964E',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

