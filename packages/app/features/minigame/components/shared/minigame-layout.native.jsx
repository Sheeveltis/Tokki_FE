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
import { NavbarMobile } from '../../../../../components/navbar-mobile'

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

  // Chỉ hiển thị game Wordle (gameType === 3) trên mobile
  const mobileGames = games.filter(game => game.gameType === 3)

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        {/* Header row removed */}

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
            {mobileGames.map((game, index) => (
              <View key={game.gameId || index} style={styles.cardItem}>
                <MinigameGameCard game={game} onPress={() => handleGamePress(game)} />
              </View>
            ))}

            {/* Ô hiển thị tính năng đang được cập nhật thêm */}
            <View style={styles.cardItem}>
              <View style={[styles.comingSoonCard, styles.card]}>
                <View style={styles.cardInner}>
                  <View style={styles.imageSection}>
                    <View style={styles.comingSoonOverlay}>
                      <Text style={styles.comingSoonEmoji}>🚀</Text>
                    </View>
                  </View>
                  <View style={styles.contentSection}>
                    <Text style={styles.comingSoonTitle}>Sắp ra mắt</Text>
                    <Text style={styles.comingSoonDesc}>Tính năng đang được cập nhật thêm...</Text>
                  </View>
                </View>
              </View>
            </View>
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

      <NavbarMobile />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50, // Tăng padding top
    paddingBottom: 80, // Để không bị navbar che
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
    width: '90%', // Thu nhỏ thêm nữa
    alignSelf: 'center',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  cardInner: {
    flex: 1,
    flexDirection: 'column',
    height: 260, // Đồng bộ chiều cao với game card
  },
  imageSection: {
    flex: 1.2, // Giảm tỷ lệ hình ảnh
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
    padding: 16,
    gap: 4,
    justifyContent: 'center',
  },
  comingSoonCard: {
    opacity: 0.8,
    borderStyle: 'dashed',
    borderColor: '#CCC',
  },
  comingSoonOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonEmoji: {
    fontSize: 48,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#999',
    fontFamily: 'Lexend, sans-serif',
  },
  comingSoonDesc: {
    fontSize: 13,
    color: '#AAA',
    fontFamily: 'Epilogue, sans-serif',
  },
})

export default MinigameLayout
