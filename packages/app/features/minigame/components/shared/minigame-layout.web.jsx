'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'

import GameCardIcon from '../../../../../assets/icon/icon-mainflow/game-card.svg'
import { NavigationPill } from 'components/navigation-pill'
import { MinigameBanner } from './minigame-banner'
import { MinigameGameCard } from './minigame-game-card'
import { getUserGames } from '../../api/api'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MinigameLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelId = searchParams?.get('level') || ''
  
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getUserGames(1, 10)
        
        if (response.isSuccess && response.data?.items) {
          setGames(response.data.items)
        } else {
          setError('Không thể tải danh sách game')
        }
      } catch (err) {
        console.error('[MinigameLayout] Error fetching games:', err)
        setError('Đã xảy ra lỗi khi tải danh sách game')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  const goToMatchingCardRule = (gameId) => {
    const query = new URLSearchParams()
    if (levelId) {
      query.set('level', levelId)
    }
    if (gameId) {
      query.set('gameId', gameId)
    }
    const url =
      query.toString().length > 0
        ? `/minigame/matching-card/matching-card-rule?${query.toString()}`
        : '/minigame/matching-card/matching-card-rule'
    router.push(url)
  }

  const goToSolitareRule = (gameId) => {
    const query = new URLSearchParams()
    if (levelId) {
      query.set('level', levelId)
    }
    if (gameId) {
      query.set('gameId', gameId)
    }
    const url =
      query.toString().length > 0
        ? `/minigame/solitare/solitare-rule?${query.toString()}`
        : '/minigame/solitare/solitare-rule'
    router.push(url)
  }

  const goToWordleRule = (gameId) => {
    const query = new URLSearchParams()
    if (levelId) {
      query.set('level', levelId)
    }
    if (gameId) {
      query.set('gameId', gameId)
    }
    const url =
      query.toString().length > 0
        ? `/minigame/wordle/wordle-rule?${query.toString()}`
        : '/minigame/wordle/wordle-rule'
    router.push(url)
  }

  const handleGamePress = (game) => {
    // Route based on gameType
    // 1 = Matching Card, 2 = Solitaire, 3 = Typing Practice (Wordle)
    if (game.gameType === 1) {
      goToMatchingCardRule(game.gameId)
    } else if (game.gameType === 2) {
      goToSolitareRule(game.gameId)
    } else if (game.gameType === 3) {
      goToWordleRule(game.gameId)
    }
  }

  return (
    <View style={styles.page}>
      <Navbar />

      <View style={styles.inner}>

        <View style={styles.centerCardWrapper}>
          <View style={styles.centerCard}>
            <View style={styles.headerRow}>
              <NavigationPill
                label="Quay lại"
                icon={ArrowIcon}
                onPress={() => router.back()}
                style={styles.backPill}
                textStyle={styles.backPillText}
                iconStyle={styles.backPillIcon}
              />

              <View style={styles.titleRow}>
                <Image
                  source={normalizeImageSource(GameCardIcon)}
                  style={styles.titleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.titleText}>MiniGame</Text>
              </View>

              <View style={styles.headerRightSpacer} />
            </View>

            <View style={styles.bannerWrapper}>
              <MinigameBanner />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B9D" />
                <Text style={styles.loadingText}>Đang tải danh sách game...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : games.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có game nào khả dụng</Text>
              </View>
            ) : (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardsContainer}
              >
                <View style={styles.cardsRow}>
                  {games.map((game, index) => (
                    <View key={game.gameId || index} style={styles.cardCol}>
                      <MinigameGameCard
                        game={game}
                        onPress={() => handleGamePress(game)}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 24,
    backgroundColor: '#FFD7D0',
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  centerCardWrapper: {
    flex: 3,
    paddingHorizontal: 40,
    height: '100%',
  },
  centerCard: {
    backgroundColor: '#F5F0DD',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: '#00000020',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    minHeight: 520,
    flex: 1,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backPill: {
    backgroundColor: '#FFFFFF',
  },
  backPillText: {
    fontWeight: '700',
  },
  backPillIcon: {
    transform: [{ scaleX: -1 }],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    paddingRight: 50,
  },
  headerRightSpacer: {
    width: 60,
  },
  bannerWrapper: {
    marginBottom: 24,
  },
  cardsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cardCol: {
    width: '48%',
    maxWidth: 320,
    alignItems: 'center',
    transform: [{ scale: 0.85 }],
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  soonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  soonBody: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonImage: {
    width: '100%',
    height: '100%',
  },
  cardPressable: {
    width: '100%',
  },
})


