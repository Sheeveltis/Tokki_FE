import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import SearchIcon from 'assets/icon/navigate-app/search.svg'
import BookIcon from 'assets/icon/navigate-app/book.svg'
import PlayIcon from 'assets/icon/icon-mainflow/sound.svg'
import { FlipCard } from 'components/FlipCard'
import { FlashcardVocabularyList } from '@tokki/app/features/study/components/shared'
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
        <View style={styles.emptyIconCircle}>
          <StudyIcon source={SearchIcon} width={40} height={40} tintColor="#CCC" />
        </View>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={onRetry}>
          <Text style={styles.resetButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Không có từ vựng
  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <StudyIcon source={SearchIcon} width={40} height={40} tintColor="#CCC" />
        </View>
        <Text style={styles.emptyText}>Chưa có từ vựng nào</Text>
      </View>
    )
  }

  // Hiển thị thông báo khi tất cả thẻ đã học xong
  if (unlearnedCount === 0 && total > 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <StudyIcon source={StarIcon} width={40} height={40} tintColor="#F1BE4B" />
        </View>
        <Text style={styles.emptyText}>Chúc mừng! Bạn đã hoàn thành tất cả từ vựng!</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onResetAllLearned}
        >
          <Text style={styles.resetButtonText}>Học lại từ đầu</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>
      {/* Flashcard */}
      <View style={styles.cardContainer}>
        {/* Navigation Arrows */}
        <Pressable
          style={({ hovered, pressed }) => [
            styles.navBtn,
            styles.prevBtn,
            hovered && styles.navBtnHover,
            pressed && styles.navBtnActive
          ]}
          onPress={onPrev}
        >
          <StudyIcon
            source={ArrowIcon}
            style={{ transform: [{ rotate: '180deg' }] }}
            width={24}
            height={24}
            tintColor="#1A1A1A"
          />
        </Pressable>

        <FlipCard
          word={current.word}
          meaning={current.meaning}
          image={current.imageUrl || undefined}
          width={700}
          height={400}
          frontColor="#79964E"
          backColor="#79964E"
          borderWidth={12}
          borderRadius={12}
          flipOnHover={false}
          isFlipped={isFlipped}
          onFlip={onFlip}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
          footer={(
            <View style={styles.controlsRowInner}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  if (current?.audioUrl) handlePlaySound();
                }}
                disabled={!current?.audioUrl}
              >
                <StudyIcon
                  source={PlayIcon}
                  width={24}
                  height={24}
                  tintColor={current?.audioUrl ? "#F1BE4B" : "#CCC"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, isFavorite && styles.controlBtnActive]}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
              >
                <StudyIcon
                  source={StarIcon}
                  width={24}
                  height={24}
                  tintColor={isFavorite ? "#FFF" : "#F1BE4B"}
                />
              </TouchableOpacity>

            </View>
          )}
        />

        <Pressable
          style={({ hovered, pressed }) => [
            styles.navBtn,
            styles.nextBtn,
            hovered && styles.navBtnHover,
            pressed && styles.navBtnActive
          ]}
          onPress={onNext}
        >
          <StudyIcon
            source={ArrowIcon}
            width={24}
            height={24}
            tintColor="#1A1A1A"
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
  toolbar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 32,
    gap: 24,
    flexWrap: 'wrap',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
    }),
  },
  toolbarLeft: {
    flex: 1,
    minWidth: 280,
    gap: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  currentCount: {
    color: '#F1BE4B',
    fontWeight: '800',
    fontSize: 16,
  },
  progressBarWrapper: {
    width: '100%',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F7F7F7',
    borderRadius: 5,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 5,
    ...(Platform.OS === 'web' && {
      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  actionBtnActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
  },
  cardContainer: {
    width: 700,
    height: 400,
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 40,
  },
  navBtn: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    top: '50%',
    marginTop: -32,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }),
  },
  navBtnHover: {
    transform: [{ scale: 1.05 }],
    backgroundColor: '#FAFAFA',
    borderColor: '#F1BE4B40',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
    }),
  },
  navBtnActive: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#F0F0F0',
  },
  prevBtn: {
    left: -32,
  },
  nextBtn: {
    right: -32,
  },
  pagination: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  controlsRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
      transition: 'all 0.2s ease',
    }),
  },
  controlBtnActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  flipControlBtn: {
    paddingHorizontal: 32,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  flipControlText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 400,
    lineHeight: 30,
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 10px 25px rgba(241,190,75,0.25)',
      transition: 'all 0.2s ease',
    }),
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
})

