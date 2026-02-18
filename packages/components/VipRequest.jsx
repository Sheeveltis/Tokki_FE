import React from 'react'
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  Platform,
} from 'react-native'
import { useRouter } from 'solito/navigation'

import VipBackground from '../assets/vip-request.png'
import BunnyCenter from '../assets/bunny/8.png'
import StarDecor from '../assets/icon/decor/19.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * VipRequest modal
 * - Hiển thị popup yêu cầu nâng cấp Premium (giống UI screenshot)
 * - Dùng chung cho web/native thông qua react-native-web
 *
 * Props:
 * - visible: boolean
 * - onClose?: () => void
 */
export function VipRequest({ visible, onClose }) {
  const router = useRouter()

  const handleClose = () => {
    if (typeof onClose === 'function') onClose()
  }

  const handlePremiumPress = () => {
    // Điều hướng tới package-screen
    router.push('/payment-package')
    if (typeof onClose === 'function') onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <ImageBackground
          source={normalizeImageSource(VipBackground)}
          style={styles.modal}
          imageStyle={styles.modalImage}
        >
          {/* Close button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          {/* Center bunny */}
          <View style={styles.centerBunnyWrapper}>
            <Image
              source={normalizeImageSource(BunnyCenter)}
              style={styles.centerBunny}
              resizeMode="contain"
            />
          </View>

          {/* Title & description */}
          <View style={styles.textBlock}>
            <Text style={styles.title}>NẠP VÚYP ĐÊ</Text>
            <Text style={styles.subtitle}>
              Bạn cần phải nâng cấp tài khoản Premium để sử dụng chức năng này
            </Text>
          </View>

          {/* Premium button + stars */}
          <View style={styles.premiumRow}>
            <Image
              source={normalizeImageSource(StarDecor)}
              style={[styles.starDecor, styles.starLeft]}
              resizeMode="contain"
            />

            <Pressable style={styles.premiumButton} onPress={handlePremiumPress}>
              <Text style={styles.premiumText}>Premium</Text>
            </Pressable>

            <Image
              source={normalizeImageSource(StarDecor)}
              style={[styles.starDecor, styles.starRight]}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 720,
    aspectRatio: 738 / 515, // gần với screenshot
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  closeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  centerBunnyWrapper: {
    marginTop: 80,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBunny: {
    width: 120,
    height: 120,
  },
  textBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
  },
  premiumRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  premiumButton: {
    backgroundColor: '#FFBB4B',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 24,
    minWidth: 180,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  premiumText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  starDecor: {
    width: 60,
    height: 60,
  },
  starLeft: {
    transform: [{ rotate: '128.06deg' }],
  },
  starRight: {
    transform: [{ rotate: '-38.35deg' }],
  },
})

export default VipRequest













