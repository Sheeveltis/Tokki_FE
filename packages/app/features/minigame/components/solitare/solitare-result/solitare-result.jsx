import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { normalizeImageSource } from '../../../../study/api'
import { getCurrentUserId } from '../../../../../provider/api/client'
import { getSolitareLeaderboard } from '../../../api/solitare-play-api'
import { useXp, XpConfigKeys, XpSourceList } from 'app/provider/xp'

import BunnyImage from '../../../../../../assets/bunny/14.png'
import CarrotImage from '../../../../../../assets/carrot.png'
import CarrotGround from '../../../../../../assets/carrot-ground.png'

export function SolitareResult({ score = 0, topPercent = 5, timeLeft = 0, onReplay, level = 'medium', isWin = false }) {
  const { addXp } = useXp()
  const awardedXPRef = useRef(false)
  const { height: windowHeight } = useWindowDimensions()
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    const userId = getCurrentUserId()
    setCurrentUserId(userId)

    // Award XP
    if (!awardedXPRef.current) {
      const awardXP = async () => {
        try {
          const lv = String(level || '').toLowerCase()
          const isLv3 = lv === 'hard' || lv === '3'
          const isLv2 = lv === 'medium' || lv === '2'
          
          let configKey = XpConfigKeys.MINIGAME_WIN_LV1
          if (isWin) {
            configKey = isLv3 ? XpConfigKeys.MINIGAME_WIN_LV3 : (isLv2 ? XpConfigKeys.MINIGAME_WIN_LV2 : XpConfigKeys.MINIGAME_WIN_LV1)
          } else {
            configKey = isLv3 ? XpConfigKeys.MINIGAME_LOSS_LV3 : (isLv2 ? XpConfigKeys.MINIGAME_LOSS_LV2 : XpConfigKeys.MINIGAME_LOSS_LV1)
          }

          await addXp(configKey, XpSourceList.MINIGAME)
          awardedXPRef.current = true
        } catch (err) {
          console.error('[SolitareResult] XP Error:', err)
        }
      }
      awardXP()
    }
  }, [level, isWin, addXp])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700'
    if (rank === 2) return '#C0C0C0'
    if (rank === 3) return '#CD7F32'
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

  useEffect(() => {
    if (!showLeaderboard) return

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true)
        setLeaderboardError(null)

        const response = await getSolitareLeaderboard({
          gameId: 'GAME002',
          level,
          pageNumber: 1,
          pageSize: 50,
        })

        const items = Array.isArray(response?.data?.items) ? response.data.items : []
        const sorted = [...items].sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
        setLeaderboard(sorted)
      } catch (error) {
        console.error('[SolitareResult] Error fetching leaderboard:', error)
        setLeaderboardError('Không thể tải bảng xếp hạng')
      } finally {
        setLoadingLeaderboard(false)
      }
    }

    fetchLeaderboard()
  }, [showLeaderboard, level])

  return (
    <View style={[styles.page, { height: Platform.OS === 'web' ? '100vh' : windowHeight }]}>
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <Image source={normalizeImageSource(BunnyImage)} style={styles.bunny} resizeMode="contain" />

          <View style={styles.textBlock}>
            <Text style={styles.title}>Chúc mừng bạn đã thành công vượt qua thử thách</Text>
            <Text style={styles.subtitle}>
              Bạn là một trong những người đạt top {topPercent}% người đứng đầu{"\n"}trong bảng xếp hạng này.
            </Text>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>{score} Điểm</Text>
            <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} resizeMode="contain" />
          </View>

          <Text style={styles.timeText}>Thời gian còn lại: {formattedTime}</Text>

          <View style={styles.buttonsContainer}>
            <Pressable onPress={onReplay} style={styles.button}>
              <Text style={styles.buttonText}>Chơi lại</Text>
            </Pressable>
            <Pressable onPress={() => setShowLeaderboard(true)} style={[styles.button, styles.leaderboardButton]}>
              <Text style={styles.buttonText}>Bảng xếp hạng</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Image
        source={normalizeImageSource(CarrotGround)}
        style={styles.carrotGround}
        resizeMode="stretch"
      />

      <Modal visible={showLeaderboard} transparent animationType="fade" onRequestClose={() => setShowLeaderboard(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 Bảng xếp hạng Solitaire</Text>
              <Pressable onPress={() => setShowLeaderboard(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {loadingLeaderboard ? (
              <View style={styles.centerBlock}>
                <ActivityIndicator size="large" color="#7FA14D" />
                <Text style={styles.helperText}>Đang tải bảng xếp hạng...</Text>
              </View>
            ) : leaderboardError ? (
              <View style={styles.centerBlock}>
                <Text style={styles.errorText}>{leaderboardError}</Text>
              </View>
            ) : leaderboard.length === 0 ? (
              <View style={styles.centerBlock}>
                <Text style={styles.helperText}>Chưa có dữ liệu</Text>
              </View>
            ) : (
              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {leaderboard.map((item, index) => {
                  const rank = index + 1
                  const rankIcon = getRankIcon(rank)
                  const rankColor = getRankColor(rank)
                  const isCurrentUser = item.userId === currentUserId
                  const titleBg = item.titleColorHex || '#E9E9E9'
                  const titleTextColor = getContrastingTextColor(titleBg)
                  const titleIconUrl = item.titleIconUrl || ''

                  return (
                    <View
                      key={item.gameMatchSessionId || `${item.userId}-${index}`}
                      style={[
                        styles.row,
                        isCurrentUser && styles.leaderboardItemCurrent,
                      ]}
                    >
                      <View style={styles.rankContainer}>
                        {rankIcon ? (
                          <Text style={styles.rankIcon}>{rankIcon}</Text>
                        ) : (
                          <Text style={[styles.rankNumber, { color: rankColor }]}>#{rank}</Text>
                        )}
                      </View>

                      <View style={styles.avatarContainer}>
                        {titleIconUrl ? (
                          <Image source={{ uri: titleIconUrl }} style={styles.avatar} resizeMode="cover" />
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>🏆</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.userInfo}>
                        <Text style={[styles.name, isCurrentUser && styles.userNameCurrent]} numberOfLines={1}>
                          {item.userName || 'Người chơi'}
                          {isCurrentUser && ' (Bạn)'}
                        </Text>
                        <View style={[styles.titleBadge, { backgroundColor: titleBg }]}>
                          <Text style={[styles.titleBadgeText, { color: titleTextColor }]} numberOfLines={1}>
                            {item.titleName || 'Chưa có danh hiệu'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.scoreContainer}>
                        <Text style={[styles.bestScore, isCurrentUser && styles.scoreTextCurrent]}>{item.bestScore || 0}</Text>
                        <Text style={styles.scoreLabel}>điểm</Text>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F3EEDC',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  contentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  carrotGround: {
    width: '100%',
    height: 190,
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
  card: {
    width: '95%',
    maxWidth: 700,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    elevation: 5,
    bottom: 50,
  },
  bunny: {
    width: Platform.OS === 'web' ? '30vh' : 180,
    height: Platform.OS === 'web' ? '30vh' : 180,
    maxHeight: 200,
    marginBottom: 12,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E05668',
  },
  carrot: {
    width: 35,
    height: 35,
  },
  timeText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    backgroundColor: '#7FA14D',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 28,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  leaderboardButton: {
    backgroundColor: '#E9A23B',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '80%',
    backgroundColor: '#F5F0DD',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#FFE4B5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    color: '#D9534F',
  },
  list: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  userNameCurrent: {
    color: '#D97706',
  },
  titleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  titleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  bestScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E05668',
  },
  scoreTextCurrent: {
    color: '#D97706',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#999',
  },
})

export default SolitareResult
