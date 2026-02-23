import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ImageBackground, Platform, Pressable } from 'react-native'
import { useSearchParams, useRouter } from 'solito/navigation'

import { WordleBoardContent } from './component/WordleBoardContent'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import { getWordleTopSentences } from '../../../api/wordle-level-api'

export function WordleBoardWeb({ dailyWordleId: propDailyWordleId }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dailyWordleId = propDailyWordleId || searchParams?.get('dailyWordleId') || ''
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!dailyWordleId) {
      console.error('[WordleBoardWeb] Missing dailyWordleId')
      setLoading(false)
      return
    }

    const fetchTopSentences = async () => {
      try {
        setLoading(true)
        const data = await getWordleTopSentences(dailyWordleId, 20)
        setSentences(data || [])
      } catch (error) {
        console.error('[WordleBoardWeb] Error fetching top sentences:', error)
        setSentences([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopSentences()
  }, [dailyWordleId])

  const handleLike = async (submissionId, isLiked) => {
    // TODO: Implement like API call
    console.log('[WordleBoardWeb] Like clicked:', submissionId, isLiked)
    // Update local state
    setSentences(prev =>
      prev.map(item =>
        item.submissionId === submissionId
          ? {
              ...item,
              isLiked: isLiked,
              likeCount: isLiked ? (item.likeCount || 0) + 1 : Math.max(0, (item.likeCount || 0) - 1),
            }
          : item
      )
    )
  }

  return (
    <ImageBackground source={BackgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }} />
            <Pressable
              style={({ pressed }) => [
                styles.homeButton,
                pressed && styles.homeButtonPressed,
              ]}
              onPress={() => router.push('/')}
            >
              <Text style={styles.homeButtonText}>Trang chủ</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>Bảng xếp hạng câu văn</Text>
          <Text style={styles.subtitle}>Top những câu văn hay nhất</Text>
        </View>

        <View style={styles.boardContainer}>
          <WordleBoardContent
            sentences={sentences}
            onLike={handleLike}
            loading={loading}
          />
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    ...Platform.select({
      web: {
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },
    }),
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  homeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      },
    }),
  },
  homeButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  homeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  boardContainer: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#FFF5E6',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    minHeight: 400,
  },
})

export default WordleBoardWeb

