import React, { useState } from 'react'
import { Image, StyleSheet, View, Text, Pressable, Platform } from 'react-native'
import CarrotImage from '../../../../../assets/carrot.png'
import BunnyDeveloping from '../../../../../assets/bunny/9.png'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { StudyIcon } from '../../../study/components/study-icon.web'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Game Type mapping:
 * 1 = Matching Card
 * 2 = Solitaire
 * 3 = Typing Practice
 */
const GAME_TYPE_NAMES = {
  1: 'Lật thẻ bài từ vựng',
  2: 'Solitaire',
  3: 'Luyện gõ phím',
}

/**
 * Game Card Component - Hiển thị game card với image từ API
 * @param {{ 
 *   game: { gameId: string; gameName: string; gameType: number; isVip: boolean; imgUrl: string };
 *   onPress?: () => void;
 * }} props
 */
export function MinigameGameCard({ game, onPress }) {
  const [hovered, setHovered] = useState(false)

  const content = (
    <View style={styles.cardInner}>
      <View style={styles.imageSection}>
        <Image
          source={normalizeImageSource(game.imgUrl || BunnyDeveloping)}
          style={styles.gameImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{game.gameName}</Text>
          {game.isVip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {game.description || 'Khám phá trò chơi để rèn luyện kỹ năng của bạn.'}
        </Text>
      </View>
    </View>
  )

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
      style={({ pressed }) => [
        styles.card,
        (pressed || hovered) && styles.cardActive,
        styles.pressable,
      ]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    aspectRatio: 1.1, // Adjusted for a slightly wider look
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
    }),
  },
  cardActive: {
    transform: [{ translateY: -6 }],
    borderColor: '#F1BE4B50',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 24px rgba(241, 190, 75, 0.12)',
    }),
  },
  cardInner: {
    flex: 1,
    flexDirection: 'column',
  },
  imageSection: {
    flex: 2, // Tỷ lệ 2/3 cho Web
    backgroundColor: '#FEF7E6',
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    flex: 1, // Tỷ lệ 1/3 cho Web
    padding: 16,
    gap: 4,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    flex: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#999', // Mờ chữ (faded)
    fontFamily: 'Epilogue, sans-serif',
    opacity: 0.8,
  },
  vipBadge: {
    backgroundColor: '#FFD70033',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B4513',
    fontFamily: 'Epilogue, sans-serif',
  },
})

