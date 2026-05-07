import React, { useEffect, useState, useRef } from 'react'
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
          <View style={styles.boardContainer}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>BẢNG XẾP HẠNG</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={() => setShowLeaderboard(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.content}>

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
                        rank === 1 && styles.itemTop1,
                        rank === 2 && styles.itemTop2,
                        rank === 3 && styles.itemTop3,
                        isCurrentUser && styles.leaderboardItemCurrent,
                      ]}
                    >
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
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
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
  bestScore: {
    fontSize: 20,
    fontWeight: '900',
    color: '#558B2F',
    fontFamily: 'Lexend, sans-serif',
  },
  scoreTextCurrent: {
    color: '#D97706',
  },
  scoreLabel: {
    color: '#999',
  },
})

export default SolitareResult
