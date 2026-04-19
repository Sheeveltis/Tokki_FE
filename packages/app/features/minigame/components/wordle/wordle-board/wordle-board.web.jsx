import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ImageBackground, Platform, Pressable, Image } from 'react-native'
import { useSearchParams, useRouter } from 'solito/navigation'

import { WordleBoardContent } from './component/WordleBoardContent'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.jpg'
import TitleBadge from '../../../../../../assets/TitleBadge.png'
import BoardBackgroundImage from '../../../../../../assets/wordle-board.png'
import { getWordleTopSentences, toggleWordleSentenceLike } from '../../../api/wordle-level-api'

export function WordleBoardWeb({ dailyWordleId: propDailyWordleId }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dailyWordleId = propDailyWordleId || searchParams?.get('dailyWordleId') || ''
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)

  console.log('[WordleBoardWeb] Received dailyWordleId:', dailyWordleId, {
    fromProp: propDailyWordleId,
    fromSearchParams: searchParams?.get('dailyWordleId'),
  })

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
    try {
      // Nếu đã like rồi thì không cho bỏ like (chỉ 1 chiều)
      if (!isLiked) return

      await toggleWordleSentenceLike(submissionId)

      // API thành công → tăng likeCount lên 1, set isLiked = true
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
      console.error('[WordleBoardWeb] Error toggling like:', error)
    }
  }

  return (
    <ImageBackground source={BackgroundImage} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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

          <View style={styles.titleWrapper}>
            <Image source={TitleBadge} style={styles.bannerImage} />
            <Text style={styles.titleText}>Bảng xếp hạng</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <ImageBackground
            source={BoardBackgroundImage}
            style={styles.boardContainer}
            imageStyle={{ resizeMode: 'stretch' }}
          >
            <WordleBoardContent
              sentences={sentences}
              onLike={handleLike}
              loading={loading}
            />
          </ImageBackground>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  bannerImage: {
    width: 270,
    height: 150,
    resizeMode: 'contain',
  },
  titleText: {
    position: 'absolute',
    top: '58%',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'web' ? 'Epilogue, sans-serif' : undefined,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  boardContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    padding: 32, // More padding to account for the image border
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    minHeight: 450,
  },
})

export default WordleBoardWeb

