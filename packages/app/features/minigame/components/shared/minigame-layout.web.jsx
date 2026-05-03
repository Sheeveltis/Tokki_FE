'use client'

import React from 'react'
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'

import GameCardIcon from '../../../../../assets/icon/icon-mainflow/game-card.svg'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'
import { MinigameBanner } from './minigame-banner'
import { MinigameGameCard } from './minigame-game-card'
import { useMinigameGames } from '../../hooks/use-minigame-games'
import WordleLevelPopup from '../wordle/wordle-rule/wordle-level-popup'
import SolitareLevelPopup from '../solitare/solitare-level/solitare-level-popup'
import MatchingCardTopicPopup from '../matching-card/matching-card-topic/matching-card-topic-popup'
import { MatchingCardLevelPopup } from '../matching-card/matching-card-level/matching-card-level-popup'
import { LoginRequest } from '../../../../../components/loginRequest'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MinigameLayout() {
  const router = useRouter()
  const {
    levelId,
    games,
    loading,
    error,
    handleGamePress,
    showWordleLevelPopup,
    setShowWordleLevelPopup,
    loadingWordleLevel,
    wordleLevelsData,
    showSolitareLevelPopup,
    setShowSolitareLevelPopup,
    showMatchingCardTopicPopup,
    setShowMatchingCardTopicPopup,
    showMatchingCardLevelPopup,
    setShowMatchingCardLevelPopup,
    showLoginRequest,
    setShowLoginRequest,
    handleSelectWordleLevel,
    handleSelectSolitareLevel,
    handleSelectMatchingCardTopic,
    handleSelectMatchingCardLevel,
  } = useMinigameGames()

  return (
    <>
      <StudyLayoutSynchronized
        title="Minigame"
        subtitle="Lựa chọn kỹ năng bạn muốn rèn luyện hôm nay để chinh phục điểm số cao nhất."
        breadcrumbPrefix="Học tập"
        breadcrumbActive="Minigame"
        onBackPress={() => router.back()}
        hideHero={true}
      >
        <View style={styles.bannerWrapper}>
          <MinigameBanner />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F1BE4B" />
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
          <View style={styles.cardsRow}>
            {games.map((game, index) => (
              <View key={game.gameId || index} style={styles.cardCol}>
                <MinigameGameCard game={game} onPress={() => handleGamePress(game)} />
              </View>
            ))}
          </View>
        )}
      </StudyLayoutSynchronized>

      {showWordleLevelPopup && (
        <WordleLevelPopup
          loading={loadingWordleLevel}
          levelsData={wordleLevelsData}
          onClose={() => setShowWordleLevelPopup(false)}
          onSelectLevel={handleSelectWordleLevel}
        />
      )}

      {showSolitareLevelPopup && (
        <SolitareLevelPopup
          visible={showSolitareLevelPopup}
          onClose={() => setShowSolitareLevelPopup(false)}
          onConfirm={handleSelectSolitareLevel}
        />
      )}

      {showLoginRequest && (
        <View style={styles.loginOverlay}>
          <LoginRequest onClose={() => setShowLoginRequest(false)} />
        </View>
      )}

      {showMatchingCardTopicPopup && (
        <MatchingCardTopicPopup
          visible={showMatchingCardTopicPopup}
          levelId={levelId}
          onClose={() => setShowMatchingCardTopicPopup(false)}
          onConfirm={handleSelectMatchingCardTopic}
        />
      )}

      {showMatchingCardLevelPopup && (
        <MatchingCardLevelPopup
          visible={showMatchingCardLevelPopup}
          onClose={() => setShowMatchingCardLevelPopup(false)}
          onConfirm={handleSelectMatchingCardLevel}
        />
      )}
    </>
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
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    minHeight: 520,
    flex: 1,
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
    fontFamily: 'Lexend, sans-serif',
    paddingRight: 50,
  },
  headerRightSpacer: {
    width: 60,
  },
  bannerWrapper: {
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '32%',
    minWidth: 300,
    alignItems: 'stretch',
    marginBottom: 40,
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
  loginOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 2000,
  },
})

export default MinigameLayout
