import React from 'react'
import { Image, Modal, Pressable, StyleSheet, Text, View, Platform } from 'react-native'

import BunnyImage from '../../../../assets/bunny/14.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Popup hướng dẫn luật chơi minigame.
 * @param {{
 *  visible: boolean
 *  onClose?: () => void
 *  onSelectTopic?: () => void
 * }} props
 */
export function MinigamePopupRule({ visible, onClose, onSelectTopic }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <View style={styles.header}>
            <Image source={normalizeImageSource(BunnyImage)} style={styles.illustration} resizeMode="contain" />
          </View>

          <View style={styles.body}>
            <Text style={styles.title}>Quy luật trò chơi :</Text>
            <Text style={styles.paragraph}>
              Bạn cần phải tìm và ghép đúng giữa những cặp thẻ có từ vựng và hình ảnh minh
              họa giống với nhau theo chủ đề mà bạn đã chọn.
            </Text>
            <Text style={styles.paragraph}>Mỗi lượt, bạn được lật 2 thẻ bất kỳ</Text>
            <Text style={styles.paragraph}>Điểm số sẽ được tính dựa trên :</Text>
            <Text style={styles.paragraph}>- Số lượt ít nhất.</Text>
            <Text style={styles.paragraph}>- Thời gian chơi nhanh nhất.</Text>
            <Text style={styles.paragraph}>- Độ khó.</Text>
          </View>

          <Pressable onPress={onSelectTopic} style={styles.ctaButton}>
            <Text style={styles.ctaText}>Chọn chủ đề</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    height: 500,
    borderRadius: 18,
    backgroundColor: '#F5F0DD',
    paddingVertical: 20,
    paddingHorizontal: 20,
    position: 'relative',
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  illustration: {
    width: 180,
    height: 180,
  },
  body: {
    gap: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
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
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})


