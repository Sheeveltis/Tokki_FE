import React from 'react'
import { Image, Pressable, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import BunnyImage from '../../../../../../assets/bunny/14.png'
import CarrotImage from '../../../../../../assets/carrot.png'
import CarrotGround from '../../../../../../assets/carrot-ground.png'

export function SolitareResult({ score = 0, topPercent = 5, timeLeft = 0, onReplay }) {
  const { height: windowHeight } = useWindowDimensions()
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

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
          </View>
        </View>
      </View>

      <Image
        source={normalizeImageSource(CarrotGround)}
        style={styles.carrotGround}
        resizeMode="stretch"
      />
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
  },
  button: {
    backgroundColor: '#7FA14D',
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 28,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default SolitareResult
