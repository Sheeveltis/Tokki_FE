'use client'

import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { getAuthToken, isCurrentTokenExpired } from '../../../../provider/api/client'
import { LoginRequest } from '../../../../../components/loginRequest'
import { getLeaderboard } from '../../api/leaderboard-logic'
import UserIcon from '../../../../../assets/user.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string' && src !== 'null' && src !== '') return { uri: src }
  return src
}

/**
 * Component hiển thị danh sách leaderboard
 * @param {Object} props
 * @param {number} props.timeFrame - TimeFrame đang được chọn (0-3)
 */
export function Leaderboard({ timeFrame = 0 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken()
      const isAuthed = Boolean(token) && !isCurrentTokenExpired()

      if (!isAuthed) {
        setShowLoginRequest(true)
        setLoading(false)
        setData([])
        return
      }

      try {
        setLoading(true)
        setError(null)
        const list = await getLeaderboard(timeFrame, 100)
        setData(list)
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        setError(err.message || 'Không thể tải bảng xếp hạng')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFrame])

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return { backgroundColor: '#FFD700', borderColor: '#FFA500' }
    if (rank === 2) return { backgroundColor: '#C0C0C0', borderColor: '#808080' }
    if (rank === 3) return { backgroundColor: '#CD7F32', borderColor: '#A0522D' }
    return { backgroundColor: '#FFFFFF', borderColor: '#E5E3DC' }
  }

  if (showLoginRequest) {
    return (
      <View style={styles.loginOverlay}>
        <LoginRequest onClose={() => setShowLoginRequest(false)} />
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B9A6B" />
        <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    )
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có dữ liệu xếp hạng</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {data.map((item, index) => {
        const rank = item.rank || index + 1
        const rankIcon = getRankIcon(rank)
        const rankStyle = getRankStyle(rank)
        const avatarSource = normalizeImageSource(item.avatarUrl) || UserIcon

        return (
          <View key={item.userId || index} style={[styles.item, rankStyle]}>
            <View style={styles.rankContainer}>
              {rankIcon ? (
                <Text style={styles.rankIcon}>{rankIcon}</Text>
              ) : (
                <View style={[styles.rankBadge, rank <= 3 && styles.rankBadgeTop]}>
                  <Text style={[styles.rankText, rank <= 3 && styles.rankTextTop]}>
                    {rank}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.avatarContainer}>
              <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {item.fullName || 'Người dùng'}
              </Text>
              <View style={styles.titleContainer}>
                <View
                  style={[
                    styles.titleBadge,
                    { backgroundColor: item.titleColor || '#E5E3DC' },
                  ]}
                >
                  <Text style={styles.titleText} numberOfLines={1}>
                    {item.titleName || 'Chưa có'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.xpContainer}>
              <Text style={styles.xpLabel}>XP</Text>
              <Text style={[styles.xpValue, rank <= 3 && styles.xpValueTop]}>
                {item.totalXP || 0}
              </Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    borderRadius: 20,
    padding: 16,
  },
  contentContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIcon: {
    fontSize: 32,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E5E3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTop: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  rankTextTop: {
    color: '#FFFFFF',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E3DC',
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E3DC',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B9A6B',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpValueTop: {
    color: '#FFA500',
  },
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
})

