import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { FlipCard } from 'components/FlipCard'
import { LoadingWithContainer } from 'components/Loading'
import { colors } from '@tokki/app/color'

/**
 * FlashcardStudyMain (Web): Nội dung chính của trang học flashcard trên web
 * Đã được tối ưu hóa cho chế độ tập trung (distraction-free)
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
  onBackPress,
  onFlip,
  onToggleFavorite,
  onNext,
  onPrev,
  onMarkAsLearned,
  onMarkAsNeedReview,
  onResetAllLearned,
  loading,
  error,
  onRetry,
}) {
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => setWindowHeight(window.innerHeight)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const [direction, setDirection] = useState('next')

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        if (e.code === 'Space') {
          e.preventDefault()
          onFlip(!isFlipped)
        } else if (e.code === 'ArrowLeft') {
          handlePrev()
        } else if (e.code === 'ArrowRight') {
          handleNext()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onFlip, isFlipped, currentIndex])

  const handleNext = () => {
    setDirection('next')
    onNext()
  }

  const handlePrev = () => {
    setDirection('prev')
    onPrev()
  }

  // Audio handling
  const handlePlaySound = () => {
    if (!current?.audioUrl) return
    const audio = new Audio(current.audioUrl)
    audio.play().catch(err => console.error('Error playing audio:', err))
  }

  if (loading) {
    return (
      <View style={[styles.container, { height: windowHeight }]}>
        <LoadingWithContainer size={48} color="#F1BE4B" text="Đang chuẩn bị từ vựng..." />
      </View>
    )
  }

  if (error || !flashcards || flashcards.length === 0) {
    return (
      <View style={[styles.container, { height: windowHeight }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error || 'Không tìm thấy từ vựng nào trong danh sách này.'}</Text>
          <Pressable style={styles.resetButton} onPress={onRetry || onBackPress}>
            <Text style={styles.resetButtonText}>Quay lại</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { height: windowHeight }]}>
      {/* Injecting physical-feel swipe animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideInRight {
          0% { transform: translate3d(40px, 0, 0) scale(0.98); opacity: 0.8; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }
        @keyframes slideInLeft {
          0% { transform: translate3d(-40px, 0, 0) scale(0.98); opacity: 0.8; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
        }
        .swipe-next {
          animation: slideInRight 0.25s cubic-bezier(0.2, 0, 0, 1) both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
        .swipe-prev {
          animation: slideInLeft 0.25s cubic-bezier(0.2, 0, 0, 1) both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
      `}} />

      {/* Nút quay lại ở góc trên trái */}
      <Pressable 
        style={({ hovered, pressed }) => [
          styles.backButton,
          hovered && styles.backButtonHover,
          pressed && styles.backButtonActive
        ]} 
        onPress={onBackPress}
      >
        <View style={styles.backIconCircle}>
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <ArrowIcon width={24} height={24} fill="#FFF" />
          </View>
        </View>
        <Text style={styles.backText}>Thoát học tập</Text>
      </Pressable>

      <View style={styles.mainContent}>
        {/* The Card with side arrows */}
        <View style={styles.cardWrapperContainer}>
          <Pressable 
            style={({ hovered, pressed }) => [
              styles.navBtn, 
              styles.sideNavBtn, 
              styles.leftSideBtn,
              hovered && styles.navBtnHover,
              pressed && styles.navBtnActive
            ]} 
            onPress={handlePrev}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ArrowIcon width={28} height={28} fill="#1A1A1A" />
            </View>
          </Pressable>

          <div 
            key={currentIndex} 
            className={direction === 'next' ? 'swipe-next' : 'swipe-prev'}
            style={{
              boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
              borderRadius: '32px',
            }}
          >
            <FlipCard
              word={current.word}
              meaning={current.meaning}
              pronunciation={current.pronunciation}
              exampleSentence={current.exampleSentence || (current._raw && current._raw.exampleSentence)}
              exampleTranslation={current.exampleTranslation || (current._raw && current._raw.exampleTranslation)}
              exampleImage={current.exampleImage || (current._raw && current._raw.exampleImage)}
              image={current.imageUrl || undefined}
              _raw={current._raw}
              width={800}
              height={500}
              frontColor="#79964E"
              backColor="#79964E"
              borderWidth={0}
              borderRadius={32}
              flipOnHover={false}
              isFlipped={isFlipped}
              onFlip={onFlip}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              onPlaySound={current?.audioUrl ? handlePlaySound : undefined}
            />
          </div>

          <Pressable 
            style={({ hovered, pressed }) => [
              styles.navBtn, 
              styles.sideNavBtn, 
              styles.rightSideBtn,
              hovered && styles.navBtnHover,
              pressed && styles.navBtnActive
            ]} 
            onPress={handleNext}
          >
            <ArrowIcon width={28} height={28} fill="#1A1A1A" />
          </Pressable>
        </View>
      </View>

      {/* Shortcuts Hint */}
      <View style={styles.shortcutsHint}>
        <Text style={styles.shortcutText}>Mẹo: Sử dụng phím <Text style={{fontWeight: '800'}}>Space</Text> để lật thẻ, phím <Text style={{fontWeight: '800'}}>Mũi tên</Text> để chuyển thẻ.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
    transition: 'all 0.2s ease',
  },
  backButtonHover: {
    transform: [{ translateX: -4 }],
  },
  backButtonActive: {
    transform: [{ scale: 0.95 }],
  },
  backIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  mainContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 60, // Gap between card and side arrows
  },
  cardWrapper: {
    boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
    borderRadius: 32,
  },
  navBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  navBtnHover: {
    backgroundColor: '#F7F7F7',
    transform: [{ scale: 1.1 }],
    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
  },
  navBtnActive: {
    transform: [{ scale: 0.9 }],
  },
  sideNavBtn: {
    // Optional: make them slightly more prominent or smaller if needed
  },
  shortcutsHint: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  shortcutText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 28,
  },
  resetButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#F1BE4B',
    borderRadius: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
})
