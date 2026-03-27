import React from 'react'
import { Image, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'

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
  const isWeb = Platform.OS === 'web'

  return (
    <View style={[styles.page, isWeb ? styles.pageWeb : styles.pageNative]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.inner, isWeb ? styles.innerWeb : styles.innerNative]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Image source={normalizeImageSource(BunnyImage)} style={styles.illustration} resizeMode="contain" />
            </View>

            <View style={styles.body}>
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
              <Pressable style={styles.ctaButton} onPress={onStart}>
                <Text style={styles.ctaText}>Chọn độ khó</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <Image source={normalizeImageSource(CarrotGround)} style={styles.ground} resizeMode="cover" />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F7F0DD',
  },
  pageWeb: {
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pageNative: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  scroll: {
    flex: 1,
  },
  inner: {
    width: '100%',
  },
  innerWeb: {
    maxWidth: 1024,
    alignSelf: 'center',
  },
  innerNative: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
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
    lineHeight: 28,
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
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ground: {
    width: '100%',
    height: Platform.OS === 'web' ? 170 : 140,
  },
})

export default WordleRule
