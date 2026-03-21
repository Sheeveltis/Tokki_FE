'use client'

import React from 'react'
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'

import GameCardIcon from '../../../../../assets/icon/icon-mainflow/game-card.svg'
import { NavigationPill } from 'components/navigation-pill'
import { MinigameBanner } from './minigame-banner'
import { MinigameGameCard } from './minigame-game-card'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { useMinigameGames } from '../../hooks/use-minigame-games'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MinigameLayout() {
  const router = useRouter()
  const { games, loading, error, handleGamePress } = useMinigameGames()

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
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                <View style={styles.cardsRow}>
                  {games.map((game, index) => (
                    <View key={game.gameId || index} style={styles.cardCol}>
                      <MinigameGameCard game={game} onPress={() => handleGamePress(game)} />
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
})

export default MinigameLayout
