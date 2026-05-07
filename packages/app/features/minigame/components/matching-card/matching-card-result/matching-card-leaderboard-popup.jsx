import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Platform, Image } from 'react-native'
import { getAllUserResults } from '../../../api/matching-card-play-api'
import { getCurrentUserId } from '../../../../../provider/api/client'

/**
 * Leaderboard Popup Component
 * @param {{
 *   visible: boolean
 *   gameId: string
 *   topicId: string
 *   gameDifficulty: number
 *   onClose: () => void
 * }} props
 */
export function MatchingCardLeaderboardPopup({ visible, gameId, topicId, gameDifficulty, onClose }) {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  // Get current user ID
  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)
  }, [])

  // Fetch leaderboard data
  useEffect(() => {
    if (!visible || !gameId || !topicId) return

    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('[MatchingCardLeaderboardPopup] Calling getAllUserResults with:', { gameId, topicId, gameDifficulty, gameType: 1 })
        const response = await getAllUserResults(gameId, topicId, gameDifficulty, 1, 100)
        console.log('[MatchingCardLeaderboardPopup] API Response:', response)
        
        if (response.isSuccess && response.data?.items) {
          // Sort theo bestScore (điểm cao nhất)
          const sorted = [...response.data.items].sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
          setLeaderboard(sorted)
        } else {
          console.warn('[MatchingCardLeaderboardPopup] API succeeded but returned no items or error:', response?.message)
          setError('Không thể tải bảng xếp hạng')
        }
      } catch (err) {
        console.error('[LeaderboardPopup] Error fetching leaderboard:', err)
        setError('Đã xảy ra lỗi khi tải bảng xếp hạng')
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [visible, gameId, topicId, gameDifficulty])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700' // Gold
    if (rank === 2) return '#C0C0C0' // Silver
    if (rank === 3) return '#CD7F32' // Bronze
    return '#666'
  }

  const getContrastingTextColor = (backgroundHex) => {
    if (!backgroundHex || typeof backgroundHex !== 'string') return '#1C1C1C'

    let hex = backgroundHex.trim().replace('#', '')
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('')
    }
    if (hex.length !== 6) return '#1C1C1C'

    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    if ([r, g, b].some((x) => Number.isNaN(x))) return '#1C1C1C'

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? '#1C1C1C' : '#FFFFFF'
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.boardContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>BẢNG XẾP HẠNG</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7FA14D" />
                <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : leaderboard.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
              </View>
            ) : (
              <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
                {leaderboard.map((item, index) => {
                  const rank = index + 1
                  const isCurrentUser = item.userId === currentUserId
                  const rankIcon = getRankIcon(rank)
                  const rankColor = getRankColor(rank)
                  const displayName = item.userName || `User ${item.userId?.slice(0, 8) || ''}`
                  const displayScore = typeof item?.bestScore === 'number' ? item.bestScore : 0
                  const titleName = item.titleName || 'Chưa có danh hiệu'
                  const titleBg = item.titleColorHex || '#E9E9E9'
                  const titleTextColor = getContrastingTextColor(titleBg)
                  const titleIconUrl = item.titleIconUrl || ''

                  return (
                    <View
                      key={item.gameMatchSessionId}
                      style={[
                        styles.leaderboardItem,
                        rank === 1 && styles.itemTop1,
                        rank === 2 && styles.itemTop2,
                        rank === 3 && styles.itemTop3,
                        isCurrentUser && styles.leaderboardItemCurrent,
                      ]}
                    >
                      {/* Rank */}
                      <View style={[
                        styles.rankContainer,
                        rank === 1 && styles.rankContainerTop1,
                        rank === 2 && styles.rankContainerTop2,
                        rank === 3 && styles.rankContainerTop3,
                      ]}>
                        <Text style={[
                          styles.rankText,
                          rank === 1 && styles.rankTextTop1,
                          rank === 2 && styles.rankTextTop2,
                          rank === 3 && styles.rankTextTop3,
                        ]}>
                          {rank === 1 ? '👑' : rank}
                        </Text>
                      </View>

                      {/* Title Icon */}
                      <View style={styles.avatarContainer}>
                        {titleIconUrl ? (
                          <Image source={{ uri: titleIconUrl }} style={styles.avatar} resizeMode="cover" />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>🏆</Text>
                          </View>
                        )}
                      </View>

                      {/* User Info */}
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, isCurrentUser && styles.userNameCurrent]}>
                          {displayName}
                          {isCurrentUser && ' (Bạn)'}
                        </Text>
                        <View style={[styles.titleBadge, { backgroundColor: titleBg }]}>
                          <Text style={[styles.titleBadgeText, { color: titleTextColor }]} numberOfLines={1}>
                            {titleName}
                          </Text>
                        </View>
                      </View>

                      {/* Score */}
                      <View style={styles.scoreContainer}>
                        <Text style={[styles.scoreText, isCurrentUser && styles.scoreTextCurrent]}>
                          {displayScore}
                        </Text>
                        <Text style={styles.scoreLabel}>điểm</Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  boardContainer: {
    width: '95%',
    maxWidth: 900,
    height: Platform.OS === 'web' ? '85vh' : '85%',
    backgroundColor: '#F3E5AB', // Light wood/parchment color
    borderRadius: 32,
    borderWidth: 8,
    borderColor: '#5D4037', // Dark wood border
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    // Cartoon-style hard shadow for web
    ...(Platform.OS === 'web' && {
      boxShadow: '8px 8px 0px 0px rgba(93, 64, 55, 0.4)',
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    height: 60,
    zIndex: 2,
  },
  titleContainer: {
    backgroundColor: '#8D6E63', // Woody brown to match theme
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#5D4037',
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  closeBtn: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 44,
    height: 44,
    backgroundColor: '#FF5252',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFDE7', // Slightly warmer paper color
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#A1887F', // Medium wood accent
    overflow: 'hidden',
    marginTop: 10,
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
  leaderboardList: {
    flex: 1,
    padding: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#8D6E63',
    // Cartoon shadow
    ...(Platform.OS === 'web' && {
      boxShadow: '4px 4px 0px 0px rgba(141, 110, 99, 0.2)',
    }),
  },
  itemTop1: {
    borderColor: '#FBC02D',
    backgroundColor: '#FFFDE7',
    borderWidth: 4,
  },
  itemTop2: {
    borderColor: '#90A4AE',
    backgroundColor: '#F4F7F8',
    borderWidth: 4,
  },
  itemTop3: {
    borderColor: '#A1887F',
    backgroundColor: '#FAF8F7',
    borderWidth: 4,
  },
  leaderboardItemCurrent: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE0C2',
    borderWidth: 2,
    borderColor: '#8D6E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankContainerTop1: {
    backgroundColor: '#FFD54F',
    borderColor: '#F57F17',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  rankContainerTop2: {
    backgroundColor: '#CFD8DC',
    borderColor: '#546E7A',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  rankContainerTop3: {
    backgroundColor: '#D7CCC8',
    borderColor: '#5D4037',
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5D4037',
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  rankTextTop1: {
    fontSize: 22,
    color: '#E65100',
  },
  rankTextTop2: {
    fontSize: 18,
    color: '#37474F',
  },
  rankTextTop3: {
    fontSize: 18,
    color: '#3E2723',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#D7CCC8',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7FA14D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D7CCC8',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3E2723',
    fontFamily: 'Lexend, sans-serif',
  },
  userNameCurrent: {
    color: '#D97706',
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  titleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    borderWidth: 2,
    borderColor: '#C5E1A5',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#558B2F',
    fontFamily: 'Lexend, sans-serif',
  },
  scoreTextCurrent: {
    color: '#D97706',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#33691E',
    textTransform: 'uppercase',
    fontFamily: 'Epilogue, sans-serif',
  },
})

