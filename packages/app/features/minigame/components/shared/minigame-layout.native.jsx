import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { MinigameBanner } from './minigame-banner'
import { MinigameGameCard } from './minigame-game-card'
import { useMinigameGames } from '../../hooks/use-minigame-games'
import WordleLevelPopup from '../wordle/wordle-rule/wordle-level-popup'
import SolitareLevelPopup from '../solitare/solitare-level/solitare-level-popup'
import MatchingCardTopicPopup from '../matching-card/matching-card-topic/matching-card-topic-popup'
import { MatchingCardLevelPopup } from '../matching-card/matching-card-level/matching-card-level-popup'
import { LoginRequest } from '../../../../../components/loginRequest'

export function MinigameLayout() {
  const navigation = useNavigation()
  const route = useRoute()
  const levelId = route?.params?.level || route?.params?.levelId || ''
  const {
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
  } = useMinigameGames({
    levelId,
    onNavigate: (screenName, params) => navigation.navigate(screenName, params),
  })

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            onPress={() => navigation.goBack()}
            style={styles.backPill}
            textStyle={styles.backPillText}
            iconStyle={styles.backPillIcon}
          />
        </View>

        <MinigameBanner />

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#FF6B9D" />
            <Text style={styles.stateText}>Đang tải danh sách game...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : games.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>Không có game nào khả dụng</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
            {games.map((game, index) => (
              <View key={game.gameId || index} style={styles.cardItem}>
                <MinigameGameCard game={game} onPress={() => handleGamePress(game)} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

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

      {showLoginRequest && (
        <View style={styles.loginOverlay}>
          <LoginRequest onClose={() => setShowLoginRequest(false)} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFD7D0',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  cardsContainer: {
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  cardItem: {
    width: '100%',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    color: '#D9534F',
    textAlign: 'center',
  },
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 2000,
  },
})

export default MinigameLayout
