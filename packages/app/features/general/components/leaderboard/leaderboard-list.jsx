'use client'

import React from 'react'
import { StyleSheet, View, Text, Image, ScrollView, Platform } from 'react-native'
import UserIcon from '../../../../../assets/user.png'

// Import background image
import BackgroundImageSource from '../../../../../assets/background4.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string' && src !== 'null' && src !== '') return { uri: src }
  return src
}

// Add CSS to hide scrollbar on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'leaderboard-hide-scrollbar'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .leaderboard-scrollview::-webkit-scrollbar {
        display: none;
      }
      .leaderboard-scrollview {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(style)
  }
}

/**
 * Component hiển thị danh sách từ top 4 trở xuống
 * @param {Object} props
 * @param {Array} props.data - Array chứa users từ top 4
 */
export function LeaderboardList({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Image 
          source={normalizeImageSource(BackgroundImageSource)} 
          style={styles.backgroundImage} 
          resizeMode="cover" 
        />
        <View style={styles.content}>
          <Text style={styles.emptyText}>Chưa có dữ liệu</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Image 
        source={normalizeImageSource(BackgroundImageSource)} 
        style={styles.backgroundImage} 
        resizeMode="cover" 
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        {...(Platform.OS === 'web' ? { className: 'leaderboard-scrollview' } : {})}
      >
        {data.map((item, index) => {
          const rank = item.rank || index + 4
          const avatarSource = normalizeImageSource(item.avatarUrl) || UserIcon

          return (
            <View key={item.userId || index} style={styles.item}>
              <View style={styles.rankContainer}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>{rank}</Text>
                </View>
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
                <Text style={styles.xpValue}>{item.totalXP || 0}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }),
  },
  contentContainer: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 12,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E5E3DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#E5E3DC',
  },
  titleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpContainer: {
    alignItems: 'flex-end',
    gap: 2,
  },
  xpLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8F8F8F',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B9A6B',
    fontFamily: 'Epilogue, sans-serif',
  },
})

