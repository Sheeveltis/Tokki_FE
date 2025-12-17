import React from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import BunnyImage from '../../../../../../assets/bunny/14.png'
import CarrotImage from '../../../../../../assets/carrot.png'

/**
 * Kết quả minigame Matching Card.
 * Hiển thị bunny, lời chúc mừng, điểm và nút chơi lại.
 *
 * @param {{
 *  score?: number
 *  topPercent?: number
 *  timeLeft?: number
 *  onReplay?: () => void
 * }} props
 */
export function MatchingCardResultContent({ score = 0, topPercent = 5, timeLeft = 0, onReplay }) {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Image source={normalizeImageSource(BunnyImage)} style={styles.bunny} resizeMode="contain" />

        <View style={styles.textBlock}>
          <Text style={styles.title}>Chúc mừng bạn đã thành công vượt qua thử thách</Text>
          <Text style={styles.subtitle}>
            Bạn là một trong những người đạt top {topPercent}% người đứng đầu{'\n'}trong bảng xếp hạng này.
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>{score} Điểm</Text>
          <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} resizeMode="contain" />
        </View>

        <Text style={styles.timeText}>Thời gian còn lại: {formattedTime}</Text>

        <Pressable onPress={onReplay} style={styles.button}>
          <Text style={styles.buttonText}>Chơi lại</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'rgba(245,240,221,0.96)',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 28,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
    }),
  },
  bunny: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 18,
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
    marginBottom: 18,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E05668',
  },
  carrot: {
    width: 40,
    height: 40,
  },
  timeText: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
    marginBottom: 6,
  },
  button: {
    marginTop: 4,
    backgroundColor: '#7FA14D',
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 24,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default MatchingCardResultContent
