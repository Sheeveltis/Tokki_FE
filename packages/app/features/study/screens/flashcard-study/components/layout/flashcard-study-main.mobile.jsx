import React, { useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Dimensions, Platform } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import { FlashcardActionButton, FlashcardVocabularyList } from '@tokki/app/features/study/components/shared'
import { FlipCardMobile } from 'components/FlipCardMobile'
import BunnyStudy from 'assets/bunny/14.png'
import BunnyTest from 'assets/bunny/15.png'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'

// Import expo-av cho mobile (nếu có)
let ExpoAudio = null
if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av')
    ExpoAudio = expoAv.Audio
  } catch (e) {
    // expo-av chưa được cài đặt
  }
}

/**
 * FlashcardStudyMain (Mobile): Nội dung chính của trang học flashcard trên mobile
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
  // Audio refs - phải đặt ở top level, trước mọi early returns
  const audioRef = useRef(null)
  const soundRef = useRef(null)

  // Cleanup audio
  const cleanupAudio = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (audioRef.current) {
        try {
          audioRef.current.pause()
        } catch (e) {
          // ignore
        }
        audioRef.current = null
      }
    } else {
      // Mobile: cleanup expo-av sound
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync()
        } catch (e) {
          // ignore
        }
        soundRef.current = null
      }
    }
  }, [])

  // Hàm phát âm thanh
  const handlePlaySound = useCallback(async () => {
    if (!current?.audioUrl) {
      return
    }

    if (Platform.OS === 'web') {
      // Web: sử dụng HTML5 Audio
      await cleanupAudio()
      const audio = typeof window !== 'undefined' && window.Audio ? new window.Audio(current.audioUrl) : null
      if (!audio) {
        return
      }
      audioRef.current = audio
      audio.volume = 1.0
      audio.play().catch((err) => {
        console.error('Error playing audio:', err)
      })
      audio.addEventListener('ended', () => {
        audioRef.current = null
      })
    } else {
      // Mobile: sử dụng expo-av
      if (!ExpoAudio) {
        console.warn('expo-av not available, cannot play audio on mobile')
        return
      }
      try {
        await cleanupAudio()
        const { sound } = await ExpoAudio.Sound.createAsync(
          { uri: current.audioUrl },
          { 
            shouldPlay: true,
            volume: 1.0,
            isMuted: false,
          }
        )
        soundRef.current = sound
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              soundRef.current = null
            } else if (status.error) {
              console.error('Playback error:', status.error)
            }
          } else if (status.error) {
            console.error('Sound load error:', status.error)
          }
        })
      } catch (err) {
        console.error('Error playing audio on mobile:', err)
      }
    }
  }, [current, cleanupAudio])

  // Cleanup khi component unmount hoặc current thay đổi
  React.useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])

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

  // Hiển thị thông báo khi tất cả thẻ đã học xong (nhưng vẫn hiển thị để ôn tập)
  // Logic này đã được xử lý trong useFlashcardStudy, nên không cần check ở đây nữa
  // Nhưng nếu muốn hiển thị thông báo đặc biệt, có thể uncomment phần này
  // if (unlearnedCount === 0 && total > 0 && !isFavoritesMode) {
  //   return (
  //     <>
  //       <View style={styles.header}>
  //         <NavigationPill
  //           label="Trở lại"
  //           to={undefined}
  //           icon={ArrowIcon}
  //           iconStyle={{ transform: [{ scaleX: -1 }] }}
  //           onPress={onBackPress}
  //           textStyle={{ fontWeight: '700' }}
  //         />
  //       </View>
  //       <View style={styles.emptyContainer}>
  //         <Text style={styles.emptyText}>Chúc mừng! Bạn đã hoàn thành tất cả từ vựng!</Text>
  //         {onResetAllLearned && (
  //           <Pressable style={styles.resetButton} onPress={onResetAllLearned}>
  //             <Text style={styles.resetButtonText}>Học lại từ đầu</Text>
  //           </Pressable>
  //         )}
  //       </View>
  //     </>
  //   )
  // }

  // Kiểm tra nếu current không có dữ liệu
  if (!current || !current.word) {
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
          <Text style={styles.emptyText}>Đang tải từ vựng...</Text>
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
        {(onFavoritesPress || onTestPress) && (
          <View style={styles.headerButtons}>
            {onFavoritesPress && (
              <Pressable style={styles.favoritesButton} onPress={onFavoritesPress}>
                <Image
                  source={normalizeImageSource(StarIcon)}
                  style={styles.favoritesIcon}
                  resizeMode="contain"
                />
                <Text style={styles.favoritesButtonText}>Từ vựng yêu thích</Text>
              </Pressable>
            )}
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
        )}
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <FlipCardMobile
          word={current.word}
          meaning={current.meaning}
          image={current.imageUrl || undefined}
          width="100%"
          height={Math.min(500, Dimensions.get('window').height * 0.5)}
          frontColor="#79964E"
          backColor="#79964E"
          borderWidth={12}
          borderRadius={12}
          isFlipped={isFlipped}
          onFlip={onFlip}
          starIcon={normalizeImageSource(StarIcon)}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
        />
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        <Pressable style={styles.navBtn} onPress={onPrev}>
          <View style={[styles.navIconContainer, { transform: [{ scaleX: -1 }] }]}>
            <ArrowIcon width={24} height={24} fill="#1F1F1F" />
          </View>
        </Pressable>
        <Text style={styles.pageText}>
          {currentIndex >= 0 ? currentIndex + 1 : 1} / {total}
        </Text>
        <Pressable style={styles.navBtn} onPress={onNext}>
          <View style={styles.navIconContainer}>
            <ArrowIcon width={24} height={24} fill="#1F1F1F" />
          </View>
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
    gap: 8,
    flexWrap: 'wrap',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    flexShrink: 1,
  },
  favoritesIcon: {
    width: 20,
    height: 20,
  },
  favoritesButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1F1F',
    flexShrink: 1,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    flexShrink: 1,
  },
  reviewIcon: {
    width: 20,
    height: 20,
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1F1F',
    flexShrink: 1,
  },
  title: {
    ...studyStyles.pageTitle,
    width: '100%',
  },
  cardContainer: {
    width: '100%',
    minHeight: 300,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagination: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

