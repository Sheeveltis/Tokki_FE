'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../assets/icon/icon-mainflow/star.svg'
import { FlipCard } from 'components/FlipCard'
import { normalizeImageSource } from '../../api'
import { studyStyles } from '../../styles'
import { getFlashcardsByTopic } from '../../api'
import { LoadingWithContainer } from '../../../../../components/Loading'

/**
 * LearnScreen: Trang học flashcard chi tiết
 * @param {{
 *   topicId?: string
 *   title?: string
 *   onBackPress?: () => void
 * }} props
 */
export function LearnScreen({
  topicId,
  title = 'Học Từ Vựng',
  onBackPress,
}) {
  const [flashcards, setFlashcards] = useState([])
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [favorites, setFavorites] = useState(new Set())
  const [learned, setLearned] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch flashcards từ API
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      setFlashcards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcards:', err)
      setError(err.message || 'Không thể tải danh sách từ vựng')
      setFlashcards([])
    } finally {
      setLoading(false)
    }
  }, [topicId])

  useEffect(() => {
    fetchFlashcards()
  }, [fetchFlashcards])

  const current = flashcards[index % flashcards.length] || {}
  const isFavorite = favorites.has(index)
  const isLearned = learned.has(index)
  const progress = flashcards.length > 0 ? Math.round((learned.size / flashcards.length) * 100) : 0

  const handleNext = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev + 1) % flashcards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
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

  const markAsLearned = () => {
    setLearned((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Render loading state
  if (loading) {
    return (
      <View style={styles.root}>
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
      </View>
    )
  }

  // Render error state
  if (error && flashcards.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.contentWrapper}>
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
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={fetchFlashcards}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  if (flashcards.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.contentWrapper}>
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
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {/* Header */}
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

        <Text style={styles.title}>{title}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {learned.size} / {flashcards.length} từ đã học ({progress}%)
          </Text>
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

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, isLearned && styles.actionButtonLearned]}
            onPress={markAsLearned}
          >
            <Text style={[styles.actionButtonText, isLearned && styles.actionButtonTextLearned]}>
              {isLearned ? '✓ Đã học' : 'Đánh dấu đã học'}
            </Text>
          </Pressable>
        </View>

        {/* Pagination */}
        <View style={styles.pagination}>
          <Pressable style={styles.navBtn} onPress={handlePrev}>
            <Image
              source={normalizeImageSource(ArrowIcon)}
              style={[styles.navIcon, { transform: [{ scaleX: -1 }] }]}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.pageText}>
            {index + 1} / {flashcards.length}
          </Text>
          <Pressable style={styles.navBtn} onPress={handleNext}>
            <Image source={normalizeImageSource(ArrowIcon)} style={styles.navIcon} resizeMode="contain" />
          </Pressable>
        </View>
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
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    ...studyStyles.pageTitle,
  },
  progressContainer: {
    width: '100%',
    gap: 8,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#79964E',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardContainer: {
    width: '100%',
    height: 524, // 500 + 12*2 (border)
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#F1BE4B',
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionButtonLearned: {
    backgroundColor: '#79964E',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionButtonTextLearned: {
    color: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '700',
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
})

export default LearnScreen

