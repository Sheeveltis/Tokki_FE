import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '@tokki/app/features/study/components/shared'
import { FlipCard } from 'components/FlipCard'
import BunnyStudy from 'assets/bunny/14.png'
import BunnyTest from 'assets/bunny/15.png'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'

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
  onTestPress,
  onFavoritesPress,
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
  isFavoritesMode = false,
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
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{error}</Text>
        <Pressable style={styles.resetButton} onPress={onRetry}>
          <Text style={styles.resetButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    )
  }

  // Không có từ vựng
  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có từ vựng nào</Text>
      </View>
    )
  }

  // Hiển thị thông báo khi tất cả thẻ đã học xong
  if (unlearnedCount === 0 && total > 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chúc mừng! Bạn đã hoàn thành tất cả từ vựng!</Text>
        <Pressable 
          style={styles.resetButton}
          onPress={onResetAllLearned}
        >
          <Text style={styles.resetButtonText}>Học lại từ đầu</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <View style={styles.statsRow}>
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Tiến độ: <Text style={{ color: '#1A1A1A', fontWeight: '800' }}>{currentIndex + 1} / {unlearnedCount}</Text> từ vựng
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.iconButton,
              isFavoritesMode && styles.iconButtonActive
            ]}
            onPress={onFavoritesPress}
          >
            <StudyIcon
              source={StarIcon}
              width={18}
              height={18}
              tintColor={isFavoritesMode ? '#FFF' : '#1A1A1A'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.testButton}
            onPress={onTestPress}
          >
            <Text style={styles.testButtonText}>Kiểm tra</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Flashcard */}
      <View style={styles.cardContainer}>
        {/* Navigation Arrows */}
        <Pressable 
          style={[styles.absNavBtn, styles.absPrevBtn]} 
          onPress={onPrev}
        >
          <StudyIcon 
            source={ArrowIcon} 
            style={{ transform: [{ scaleX: -1 }] }} 
            width={28}
            height={28}
          />
        </Pressable>

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
          onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
        />

        <Pressable 
          style={[styles.absNavBtn, styles.absNextBtn]} 
          onPress={onNext}
        >
          <StudyIcon 
            source={ArrowIcon} 
            width={28}
            height={28}
          />
        </Pressable>
      </View>

      {/* Pagination text only at bottom */}
      <View style={styles.pagination}>
        <Text style={styles.pageText}>
          {currentIndex + 1} / {unlearnedCount}
        </Text>
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
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  progressSection: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  iconButtonActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  testButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardContainer: {
    width: '100%',
    height: 524,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  absNavBtn: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    top: '50%',
    marginTop: -28,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      transition: 'all 0.2s ease',
    }),
  },
  absPrevBtn: {
    left: -28,
  },
  absNextBtn: {
    right: -28,
  },
  pagination: {
    display: 'none',
  },
  emptyContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(241,190,75,0.2)',
    }),
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
})

