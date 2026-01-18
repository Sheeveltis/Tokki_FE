import React from 'react'
import { Image, StyleSheet, Text, View, Platform } from 'react-native'

import BunnyImage from '../../../../../../assets/bunny/14.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Nội dung luật chơi matching-card (dạng section, không còn popup)
 */
export function MatchingCardRuleBody({ onSelectTopic }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={normalizeImageSource(BunnyImage)} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>Quy luật trò chơi :</Text>
          <Text style={styles.paragraph}>
            Bạn cần phải tìm và ghép đúng giữa những cặp thẻ có từ vựng và hình ảnh minh họa giống với nhau theo chủ đề
            mà bạn đã chọn.
          </Text>
          <Text style={styles.paragraph}>Mỗi lượt, bạn được lật 2 thẻ bất kỳ</Text>
          <Text style={styles.paragraph}>Điểm số sẽ được tính dựa trên :</Text>
          <Text style={styles.paragraph}>- Số lượt ít nhất.</Text>
          <Text style={styles.paragraph}>- Thời gian chơi nhanh nhất.</Text>
          <Text style={styles.paragraph}>- Độ khó.</Text>
        </View>

        {onSelectTopic ? (
          <View style={styles.ctaButton} onStartShouldSetResponder={() => true} onResponderRelease={onSelectTopic}>
            <Text style={styles.ctaText}>Chọn chủ đề</Text>
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 1000,
    borderRadius: 18,
    backgroundColor: '#F7F0DD',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',  
  },
  illustration: {
    width: 150,
    height: 150,
    right: 10,
  },
  body: {
    gap: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 30,
    color: '#1C1C1C',
  },
  ctaButton: {
    alignSelf: 'center',
    backgroundColor: '#7FA14D',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    minWidth: 180,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
    right: 10,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default MatchingCardRuleBody

