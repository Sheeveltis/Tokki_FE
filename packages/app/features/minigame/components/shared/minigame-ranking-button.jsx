import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

import StarIcon from '../../../../../assets/icon/decor/19.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

// MinigameRankingButton: thẻ "Bảng xếp hạng" dùng ngôi sao trang trí
// Giống card "Bạn đã học được ..." trong StudyStatsCards nhưng chỉ hiển thị text "Bảng xếp hạng"
export function MinigameRankingButton() {
  return (
    <View style={styles.wrapper}>
      {/* Card chính */}
      <View style={styles.card}>
        {/* Icon ngôi sao trang trí góc trên bên phải */}
        <View style={styles.starsContainer}>
          <Image
            source={normalizeImageSource(StarIcon)}
            style={styles.star}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.label}>Bảng xếp hạng</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#BAD7A1', // nền xanh lá nhạt
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#6DAB1D', // viền xanh lá đậm
    minWidth: 150,
    position: 'relative',
    shadowColor: '#00000010',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  starsContainer: {
    position: 'absolute',
    top: -22,
    right: -20,
    zIndex: 1,
  },
  star: {
    width: 60,
    height: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})


