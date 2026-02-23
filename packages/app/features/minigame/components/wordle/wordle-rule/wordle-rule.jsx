import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import BunnyImage from '../../../../../../assets/bunny/14.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function WordleRule({ onStart }) {
  return (
    <View style={styles.page}>
      <View style={styles.inner}>
        <View style={styles.container}>
          <View style={styles.card}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.header}
              onStartShouldSetResponder={() => true}
            >
              <Image source={normalizeImageSource(BunnyImage)} style={styles.illustration} resizeMode="contain" />
            </View>

            <View style={styles.body}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.title}>Quy luật trò chơi :</Text>
              <Text style={styles.paragraph}>
                Sẽ có những ô vuông để bạn có thể nhập bằng chữ cái tiếng hàn vào và nhập từ có nghĩa vào ở đó bạn có thể xem được chữ cái nào đang được sử dụng cho đúng ở đó
              </Text>
              <Text style={styles.paragraph}>
                Nếu những ô được hiển hiện màu xanh có nghĩa là trong từ keyword bạn đang tìm kiếm có những ô đó, còn nếu ô màu vàng thì sẽ là không có
              </Text>
              <Text style={styles.paragraph}>Điểm số sẽ được tính dựa trên :</Text>
              <Text style={styles.paragraph}>- Số lượt ít nhất.</Text>
              <Text style={styles.paragraph}>- Thời gian chơi nhanh nhất.</Text>
              <Text style={styles.paragraph}>- Độ khó.</Text>
            </View>

            {onStart ? (
              <View style={styles.ctaButton} onStartShouldSetResponder={() => true} onResponderRelease={onStart}>
                <Text style={styles.ctaText}>Chọn độ khó</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <Image source={normalizeImageSource(CarrotGround)} style={styles.ground} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    height: '100vh',
    backgroundColor: '#F7F0DD',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  inner: {
    width: '100%',
    maxWidth: 1024,
    alignItems: 'stretch',
    flexShrink: 0,
  },
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
    right: 10,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ground: {
    width: '100%',
    height: 190,
    top: 12,
  },
})

export default WordleRule



