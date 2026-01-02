import React from 'react'
import { Image, StyleSheet, View, Text, Pressable, Platform } from 'react-native'
import BackgroundImage from '../../../../assets/background3.png'
import CarrotImage from '../../../../assets/carrot.png'
import BunnyDeveloping from '../../../../assets/bunny/9.png'

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
  const gameTypeName = GAME_TYPE_NAMES[game.gameType] || game.gameName

  const header = (
    <View style={styles.headerContent}>
      {game.isVip && (
        <View style={styles.vipBadge}>
          <Text style={styles.vipText}>VIP</Text>
        </View>
      )}
      <Text style={styles.title}>{gameTypeName}</Text>
    </View>
  )

  const content = (
    <View style={styles.wrapper}>
      <Image source={normalizeImageSource(BackgroundImage)} style={styles.background} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerBox}>{header}</View>

        <View style={styles.body}>
          {game.imgUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={normalizeImageSource(game.imgUrl)}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.imageContainer}>
              <Image
                source={normalizeImageSource(BunnyDeveloping)}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotTopRight]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotMidLeft]} />
        <Image source={normalizeImageSource(CarrotImage)} style={[styles.carrot, styles.carrotBottomRight]} />
      </View>
    </View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    )
  }

  return content
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  wrapper: {
    width: '100%',
    maxWidth: 640,
    borderRadius: 32,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 24,
  },
  headerBox: {
    backgroundColor: '#F4EDE7',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vipBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8B4513',
    fontFamily: 'Epilogue, sans-serif',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
  },
  body: {
    marginTop: 8,
  },
  imageContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  carrot: {
    position: 'absolute',
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  carrotTopRight: {
    top: -10,
    right: 20,
  },
  carrotMidLeft: {
    top: 140,
    left: 40,
  },
  carrotBottomRight: {
    bottom: -8,
    right: 80,
  },
})

