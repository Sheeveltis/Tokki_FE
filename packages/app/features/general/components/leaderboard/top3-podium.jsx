'use client'

import React from 'react'
import { StyleSheet, View, Text, Image, Platform } from 'react-native'

// Import images
import Top1ImageSource from '../../../../../assets/icon/decor/19.png'
import Top2ImageSource from '../../../../../assets/icon/decor/18.png'
import Top3ImageSource from '../../../../../assets/icon/decor/18.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string' && src !== 'null' && src !== '') return { uri: src }
  return src
}


/**
 * Component hiển thị top 3 users trên podium
 * @param {Object} props
 * @param {Array} props.top3 - Array chứa top 3 users [top2, top1, top3]
 */
export function Top3Podium({ top3 = [] }) {
  // Luôn hiển thị 3 vị trí, điền null nếu không có
  // Nếu chỉ có 1 user thì hiển thị ở top1 (giữa)
  // Nếu có 2 users thì hiển thị ở top1 và top2
  // Nếu có 3+ users thì hiển thị đầy đủ top1, top2, top3
  let top2 = null
  let top1 = null
  let top3User = null
  
  if (top3.length === 1) {
    top1 = top3[0]
  } else if (top3.length === 2) {
    top1 = top3[0]
    top2 = top3[1]
  } else if (top3.length >= 3) {
    top2 = top3[0]
    top1 = top3[1]
    top3User = top3[2]
  }

  return (
    <View style={styles.container}>
      {/* Top 2 - Left */}
      <View style={styles.podiumItem}>
        {top2 ? (
          <>
            <Image
              source={normalizeImageSource(Top2ImageSource)}
              style={styles.decorImage}
              resizeMode="contain"
            />
            <View style={styles.userCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>2</Text>
              </View>
              <Image
                source={normalizeImageSource(top2.avatarUrl)}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.userName} numberOfLines={1}>
                {top2.fullName || 'Người dùng'}
              </Text>
              <View style={styles.titleContainer}>
                <View
                  style={[
                    styles.titleBadge,
                    { backgroundColor: top2.titleColor || '#E5E3DC' },
                  ]}
                >
                  <Text style={styles.titleText} numberOfLines={1}>
                    {top2.titleName || 'Chưa có'}
                  </Text>
                </View>
              </View>
              <Text style={styles.xpValue}>{top2.totalXP || 0} XP</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyPodium} />
        )}
      </View>

      {/* Top 1 - Center */}
      <View style={[styles.podiumItem, styles.podiumCenter]}>
        {top1 ? (
          <>
            <Image
              source={normalizeImageSource(Top1ImageSource)}
              style={styles.decorImageCenter}
              resizeMode="contain"
            />
            <View style={[styles.userCard, styles.userCardCenter]}>
              <View style={[styles.rankBadge, styles.rankBadgeGold]}>
                <Text style={styles.rankTextGold}>1</Text>
              </View>
              <Image
                source={normalizeImageSource(top1.avatarUrl)}
                style={styles.avatarCenter}
                resizeMode="cover"
              />
              <Text 
                style={styles.userNameCenter} 
                numberOfLines={1}
              >
                {top1.fullName || 'Người dùng'}
              </Text>
              <View style={styles.titleContainer}>
                <View
                  style={[
                    styles.titleBadge,
                    { backgroundColor: top1.titleColor || '#E5E3DC' },
                  ]}
                >
                  <Text style={styles.titleText} numberOfLines={1}>
                    {top1.titleName || 'Chưa có'}
                  </Text>
                </View>
              </View>
              <Text style={styles.xpValueCenter}>
                {top1.totalXP || 0} XP
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyPodium} />
        )}
      </View>

      {/* Top 3 - Right */}
      <View style={styles.podiumItem}>
        {top3User ? (
          <>
            <Image
              source={normalizeImageSource(Top3ImageSource)}
              style={styles.decorImage}
              resizeMode="contain"
            />
            <View style={styles.userCard}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>3</Text>
              </View>
              <Image
                source={normalizeImageSource(top3User.avatarUrl)}
                style={styles.avatar}
                resizeMode="cover"
              />
              <Text style={styles.userName} numberOfLines={1}>
                {top3User.fullName || 'Người dùng'}
              </Text>
              <View style={styles.titleContainer}>
                <View
                  style={[
                    styles.titleBadge,
                    { backgroundColor: top3User.titleColor || '#E5E3DC' },
                  ]}
                >
                  <Text style={styles.titleText} numberOfLines={1}>
                    {top3User.titleName || 'Chưa có'}
                  </Text>
                </View>
              </View>
              <Text style={styles.xpValue}>{top3User.totalXP || 0} XP</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyPodium} />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 150,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 150,

  },
  podiumCenter: {
    flex: 1.5,
    maxWidth: 180,
  },
  decorImage: {
    width: 50,
    height: 50,
    marginBottom: -20,
    zIndex: 1,
  },
  decorImageCenter: {
    width: 60,
    height: 60,
    marginBottom: -40,
    zIndex: 1,
    left: 80,
  },
  userCard: {
    backgroundColor: '#AC6B41',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B5433',
    minHeight: 130,
    justifyContent: 'flex-end',
  },
  userCardCenter: {
    minHeight: 180,
    padding: 10,
    borderColor: '#D4AF37',
    borderWidth: 3,
  },
  rankBadge: {
    width: 25,
    height: 25,
    borderRadius: 16,
    backgroundColor: '#C0C0C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
    width: 25,
    height: 25,
    borderRadius: 20,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  rankTextGold: {
    fontSize: 15,
    fontWeight: '800',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginBottom: 8,
  },
  avatarCenter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    textAlign: 'center',
  },
  userNameCenter: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#FFD700',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'center',
  },
  titleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#E5E3DC',
  },
  titleText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpValueCenter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
  },
  emptyPodium: {
    width: '100%',
    height: 180,
    backgroundColor: '#8B6F47',
    borderRadius: 16,
    opacity: 0.3,
  },
})

