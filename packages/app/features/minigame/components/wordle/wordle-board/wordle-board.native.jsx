import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Platform } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'

import { WordleBoardContent } from './component/WordleBoardContent'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.jpg'
import { getWordleTopSentences, toggleWordleSentenceLike } from '../../../api/wordle-level-api'
import TitleBadge from '../../../../../../assets/TitleBadge.png'

export function WordleBoardNative({ dailyWordleId: propDailyWordleId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dailyWordleId = propDailyWordleId || searchParams?.get?.('dailyWordleId') || ''

  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dailyWordleId) {
      setLoading(false)
      return
    }

    const fetchTopSentences = async () => {
      try {
        setLoading(true)
        const data = await getWordleTopSentences(dailyWordleId, 20)
        setSentences(data || [])
      } catch (error) {
        console.error('[WordleBoardNative] Error fetching top sentences:', error)
        setSentences([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopSentences()
  }, [dailyWordleId])

  const handleLike = async (submissionId, isLiked) => {
    try {
      if (!isLiked) return

      await toggleWordleSentenceLike(submissionId)

      setSentences(prev =>
        prev.map(item =>
          item.submissionId === submissionId
            ? {
              ...item,
              isLiked: true,
              likeCount: (item.likeCount || 0) + 1,
            }
            : item
        )
      )
    } catch (error) {
      console.error('[WordleBoardNative] Error toggling like:', error)
    }
  }

  return (
    <ImageBackground source={BackgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </Pressable>

          <View style={styles.titleWrapper}>
            <Image source={TitleBadge} style={styles.bannerImage} />
            <Text style={styles.title}>Bảng xếp hạng</Text>
          </View>
          <Text style={styles.subtitle}>Top những câu văn hay nhất</Text>
        </View>

        <View style={styles.boardContainer}>
          <WordleBoardContent
            sentences={sentences}
            loading={loading}
            onLike={handleLike}
          />
        </View>
      </View>
    </ImageBackground>
  )
}

export default WordleBoardNative

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  titleWrapper: {
    width: 240,
    height: 70,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  boardContainer: {
    flex: 1,
    backgroundColor: '#FFF5E6',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
})