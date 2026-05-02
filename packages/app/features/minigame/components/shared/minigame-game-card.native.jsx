import React, { useState } from 'react'
import { Image, StyleSheet, View, Text, Pressable, Platform } from 'react-native'
import BunnyDeveloping from '../../../../../assets/bunny/9.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Game Card Component (Native) - Hiển thị game card với tỷ lệ ngang thu nhỏ cho mobile
 */
export function MinigameGameCard({ game, onPress }) {
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
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardActive,
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
    height: 300, // Giảm chiều cao tổng thể để bớt khoảng trắng dư thừa
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardActive: {
    transform: [{ scale: 0.98 }],
    borderColor: '#F1BE4B50',
    backgroundColor: '#F9F9F9',
  },
  cardInner: {
    flex: 1,
    flexDirection: 'column',
  },
  imageSection: {
    flex: 2, // Tăng diện tích hình ảnh để lấp đầy khoảng trống
    backgroundColor: '#FEF7E6',
    overflow: 'hidden',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    flex: 1, // Phần chữ chiếm diện tích vừa đủ
    padding: 12,
    justifyContent: 'flex-start', // Đưa chữ lên trên để bớt trống bên dưới
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    flex: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    color: '#888',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 2,
  },
  vipBadge: {
    backgroundColor: '#FFD70033',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  vipText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B4513',
  },
})
