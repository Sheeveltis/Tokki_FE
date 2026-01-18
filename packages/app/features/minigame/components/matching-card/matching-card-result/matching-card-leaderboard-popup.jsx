import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native'
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
        
        const response = await getAllUserResults(gameId, topicId, gameDifficulty, 1, 100)
        
        if (response.isSuccess && response.data?.items) {
          // Sort by bestScore descending
          const sorted = [...response.data.items].sort((a, b) => b.bestScore - a.bestScore)
          setLeaderboard(sorted)
        } else {
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

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🏆 Bảng Xếp Hạng</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
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
                  const displayName = `User ${item.userId.slice(0, 8)}`

                  return (
                    <View
                      key={item.gameMatchSessionId}
                      style={[
                        styles.leaderboardItem,
                        isCurrentUser && styles.leaderboardItemCurrent,
                      ]}
                    >
                      {/* Rank */}
                      <View style={styles.rankContainer}>
                        {rankIcon ? (
                          <Text style={styles.rankIcon}>{rankIcon}</Text>
                        ) : (
                          <Text style={[styles.rankNumber, { color: rankColor }]}>#{rank}</Text>
                        )}
                      </View>

                      {/* Avatar */}
                      <View style={styles.avatarContainer}>
                        <View style={styles.avatarPlaceholder}>
                          <Text style={styles.avatarText}>
                            {displayName[5]?.toUpperCase() || 'U'}
                          </Text>
                        </View>
                      </View>

                      {/* User Info */}
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, isCurrentUser && styles.userNameCurrent]}>
                          {displayName}
                          {isCurrentUser && ' (Bạn)'}
                        </Text>
                        <Text style={styles.userIdText}>ID: {item.userId}</Text>
                      </View>

                      {/* Score */}
                      <View style={styles.scoreContainer}>
                        <Text style={[styles.scoreText, isCurrentUser && styles.scoreTextCurrent]}>
                          {item.bestScore}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  popup: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    backgroundColor: '#F5F0DD',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFE4B5',
    borderBottomWidth: 2,
    borderBottomColor: '#E9C46A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
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
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  leaderboardItemCurrent: {
    backgroundColor: '#FFF4E6',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIcon: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Lexend, sans-serif',
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
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7FA14D',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Lexend, sans-serif',
  },
  userNameCurrent: {
    color: '#D97706',
  },
  userIdText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E05668',
    fontFamily: 'Lexend, sans-serif',
  },
  scoreTextCurrent: {
    color: '#D97706',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
})

