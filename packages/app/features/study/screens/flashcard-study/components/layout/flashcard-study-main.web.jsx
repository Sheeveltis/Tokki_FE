import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, TouchableOpacity, Image } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import DictionaryIcon from 'assets/icon/navigate-app/dictionary.svg'
import SearchIcon from 'assets/icon/navigate-app/search.svg'
import BookIcon from 'assets/icon/navigate-app/book.svg'
import PlayIcon from 'assets/icon/icon-mainflow/sound.svg'
import DefaultBunny from 'assets/bunny/14.png'
import { FlipCard } from 'components/FlipCard'
import { FlashcardVocabularyList } from '@tokki/app/features/study/components/shared'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import ButtonUI from 'components/decor/buttonUI'

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
  const [isStudying, setIsStudying] = React.useState(false)
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
    if (Platform.OS !== 'web' || !isStudying) return

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
  }, [isFlipped, onFlip, onNext, onPrev, isStudying])

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

  if (!isStudying) {
    return (
      <View style={{ flex: 1, width: '100%', alignSelf: 'center' }}>
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <View style={styles.heroVisual}>
              <View style={styles.heroRabbitCircle}>
                 <Image source={DefaultBunny} style={{ width: 60, height: 60 }} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.heroMain}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroHeading}>
                  Danh sách {flashcards.length} từ vựng!
                </Text>
                <Text style={styles.heroSubHeading}>
                  Xem hình ảnh, nghe phát âm và ghi nhớ ý nghĩa của các từ vựng này.
                </Text>
              </View>
            </View>

            <View style={styles.heroAction}>
              <ButtonUI 
                onClick={() => setIsStudying(true)}
                type="C"
              >
                Học Flashcard
              </ButtonUI>
            </View>
          </View>
        </View>

        <FlashcardVocabularyList
          flashcards={flashcards}
          favorites={favorites}
          onSelectFlashcard={onSelectFlashcard}
          onToggleFavorite={onToggleFavorite}
        />
      </View>
    )
  }

  // Chế độ học Flashcard
  return (
    <View style={styles.studyWrapper}>
      <View style={styles.studyHeader}>
        <TouchableOpacity 
          style={styles.backButtonSimple}
          onPress={() => setIsStudying(false)}
        >
          <StudyIcon
            source={ArrowIcon}
            style={{ transform: [{ rotate: '180deg' }] }}
            width={16}
            height={16}
            tintColor="#666"
          />
          <Text style={styles.backButtonText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>

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
          height={420}
          frontColor="#79964E"
          backColor="#79964E"
          borderWidth={12}
          borderRadius={24}
          flipOnHover={false}
          isFlipped={isFlipped}
          onFlip={onFlip}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
          footer={(
            <View style={styles.controlsRowInner}>
                <TouchableOpacity
                  style={[styles.controlBtn, current?.audioUrl && styles.controlBtnActive]}
                  onPress={(e) => {
                    e.stopPropagation();
                    if (current?.audioUrl) handlePlaySound();
                  }}
                  disabled={!current?.audioUrl}
                >
                  <StudyIcon
                    source={PlayIcon}
                    width={28}
                    height={28}
                    tintColor={current?.audioUrl ? "#FFF" : "#CCC"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    const url = `https://dict.naver.com/search.nhn?query=${encodeURIComponent(current.word)}`
                    window.open(url, '_blank')
                  }}
                >
                  <StudyIcon
                    source={DictionaryIcon}
                    width={28}
                    height={28}
                    tintColor="#F1BE4B"
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
                    width={28}
                    height={28}
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
        <View style={styles.pageBadge}>
          <Text style={styles.pageText}>
            {currentIndex + 1} / {flashcards.length}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  heroVisual: {
    width: 100,
    height: 100,
  },
  heroRabbitCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF9EB',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
  },
  heroMain: {
    flex: 1,
    gap: 12,
  },
  heroTextContent: {
    gap: 6,
  },
  heroHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  heroSubHeading: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  heroAction: {
    alignItems: 'flex-end',
  },
  studyWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  studyHeader: {
    width: '100%',
    maxWidth: 700,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    marginTop: 0,
  },
  backButtonSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardContainer: {
    width: 700,
    height: 420,
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 32,
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
    borderColor: '#EFEFEF',
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
  pagination: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  pageBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
})




