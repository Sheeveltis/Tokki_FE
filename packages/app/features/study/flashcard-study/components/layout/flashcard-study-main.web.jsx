import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '../../../components/shared'
import { FlipCard } from 'components/FlipCard'
import BunnyStudy from '../../../../../../assets/bunny/14.png'
import BunnyTest from '../../../../../../assets/bunny/15.png'
import { normalizeImageSource } from '../../../api'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'

/**
 * FlashcardStudyMain (Web): Nội dung chính của trang học flashcard trên web
 */
export function FlashcardStudyMain({
  title,
  flashcards,
  current,
  currentIndex,
  total,
  unlearnedCount,
  isFlipped,
  isFavorite,
  isLearned,
  favorites,
  onBackPress,
  onLearnPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onNext,
  onPrev,
  onSelectFlashcard,
  onMarkAsLearned,
  onMarkAsNeedReview,
  onResetAllLearned,
  loading,
  error,
  onRetry,
}) {
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

  // Xử lý phím bàn phím: Space để flip, mũi tên để chuyển card
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyPress = (event) => {
      // Space: Flip card
      if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        onFlip(!isFlipped)
        return
      }

      // Mũi tên trái: Card trước
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
        return
      }

      // Mũi tên phải: Card tiếp theo
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
        return
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isFlipped, onFlip, onNext, onPrev])

  // Loading state
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

  // Error state
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable style={styles.resetButton} onPress={onRetry}>
            <Text style={styles.resetButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      </>
    )
  }

  // Không có từ vựng
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

  // Hiển thị thông báo khi tất cả thẻ đã học xong
  if (unlearnedCount === 0 && total > 0) {
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
          <Pressable 
            style={styles.resetButton}
            onPress={onResetAllLearned}
          >
            <Text style={styles.resetButtonText}>Học lại từ đầu</Text>
          </Pressable>
        </View>
      </>
    )
  }

  // Hiển thị thông báo khi chưa có thẻ nào
  if (total === 0) {
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
          onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
        />
      </View>

      {/* Mark as Learned Button */}
      <View style={styles.learnedButtonContainer}>
        {isLearned ? (
          <Pressable style={styles.learnedButton} onPress={onMarkAsNeedReview}>
            <Text style={styles.learnedButtonText}>Cần ôn lại</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.learnedButton} onPress={onMarkAsLearned}>
            <Text style={styles.learnedButtonText}>Đánh dấu đã học</Text>
          </Pressable>
        )}
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
          {currentIndex + 1} / {unlearnedCount} (Tổng: {total})
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
  learnedButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  learnedButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#79964E',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  learnedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#79964E',
    marginTop: 16,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})

