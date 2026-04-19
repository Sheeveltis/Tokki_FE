'use client'

import React, { useState, useMemo } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { LeaderboardBanner } from './leaderboard-banner'
import { TimeFrameDropdown } from './timeframe-dropdown'
import { SortByDropdown } from './sortby-dropdown'
import { Top3Podium } from './top3-podium'
import { LeaderboardList } from './leaderboard-list'
import { getLeaderboard } from '../../api/leaderboard-logic'
import { getAuthToken, isCurrentTokenExpired } from '../../../../provider/api/client'
import { LoginRequest } from '../../../../../components/loginRequest'
import { ActivityIndicator, Text } from 'react-native'

// Import carrot ground image
import CarrotGroundImage from '../../../../../assets/carrot-ground.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string' && src !== 'null' && src !== '') return { uri: src }
  return src
}

/**
 * Layout component cho leaderboard page
 */
export function LeaderboardLayoutWeb() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0)
  const [selectedSortBy, setSelectedSortBy] = useState('xp')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  React.useEffect(() => {
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
        console.log('Fetching leaderboard for timeFrame:', selectedTimeFrame)
        const list = await getLeaderboard(selectedTimeFrame, 100)
        console.log('Leaderboard data received:', list)
        console.log('Data type:', typeof list)
        console.log('Is array:', Array.isArray(list))
        console.log('Data length:', list?.length)
        
        if (Array.isArray(list)) {
          console.log('First item:', list[0])
          setData(list)
        } else {
          console.warn('Received non-array data:', list)
          setData([])
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
        console.error('Error response:', err.response?.data)
        setError(err.message || 'Không thể tải bảng xếp hạng')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTimeFrame])

  // Sort data based on selectedSortBy
  const sortedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data to sort')
      return []
    }
    const sorted = [...data]
    // Sort by XP or Streak descending
    if (selectedSortBy === 'streak') {
      sorted.sort((a, b) => (b.streak || 0) - (a.streak || 0))
    } else {
      sorted.sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0))
    }
    console.log('Sorted data by', selectedSortBy, ':', sorted.slice(0, 5))
    return sorted
  }, [data, selectedSortBy])

  // Split data into top 3 and rest
  const top3 = useMemo(() => {
    if (sortedData.length < 3) {
      console.log('Less than 3 users, returning all:', sortedData)
      return sortedData
    }
    // Reorder: [2nd, 1st, 3rd] for podium display
    const reordered = [sortedData[1], sortedData[0], sortedData[2]]
    console.log('Top 3 reordered:', reordered.map(u => ({ name: u.fullName, xp: u.totalXP })))
    return reordered
  }, [sortedData])

  const restData = useMemo(() => {
    const rest = sortedData.slice(3)
    console.log('Rest data (from rank 4):', rest.length, 'users')
    return rest
  }, [sortedData])

  if (showLoginRequest) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.loginOverlay}>
          <LoginRequest onClose={() => setShowLoginRequest(false)} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.bannerContainer}>
          <TimeFrameDropdown
            selectedTimeFrame={selectedTimeFrame}
            onTimeFrameChange={setSelectedTimeFrame}
          />
          <LeaderboardBanner />
          <SortByDropdown
            selectedSortBy={selectedSortBy}
            onSortByChange={setSelectedSortBy}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B9A6B" />
            <Text style={styles.loadingText}>Đang tải bảng xếp hạng...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : sortedData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
          </View>
        ) : (
          <View style={styles.contentWrapper}>
            <Top3Podium top3={top3} />
            <View style={styles.listWrapper}>
              <LeaderboardList data={restData} />
            </View>
          </View>
        )}

      </View>
      <Image
        source={normalizeImageSource(CarrotGroundImage)}
        style={styles.carrotGround}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100vh',
    backgroundColor: '#F5E6D3',
    overflow: 'hidden',
    position: 'relative',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 110, // Space for carrot ground
    height: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    overflow: 'visible',
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  listWrapper: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    index: 100,
  },
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  carrotGround: {
    width: '100%',
    height: 180,
    position: 'fixed',
    left: 0,
    right: 0,
    zIndex: 1,
    bottom: -50,
  },
})

