import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { colors } from '../app/color'
import BunnyImage from '../assets/bunny/14.png'
import SmallFoot from '../assets/smallfoot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

/**
 * LoginRequest: modal/section yêu cầu đăng nhập
 * Được thiết kế lại theo phong cách "One Board" cao cấp, đồng bộ với theme hệ thống.
 */
export const LoginRequest = ({ onClose }) => {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/login')
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <View style={styles.container}>
      {/* Background decoration */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={styles.footprintDecor}
      />

      {/* Close button */}
      <TouchableOpacity
        onPress={handleClose}
        style={styles.closeButton}
        activeOpacity={0.6}
      >
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      {/* Bunny illustration */}
      <View style={styles.imageWrapper}>
        <Image
          source={normalizeImageSource(BunnyImage)}
          style={styles.bunnyImage}
        />
        {/* Subtle glow effect behind bunny */}
        <View style={styles.bunnyGlow} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>BẠN CHƯA ĐĂNG NHẬP</Text>
        <Text style={styles.subtitle}>
          Vui lòng đăng nhập để có thể sử dụng đầy đủ các tính năng học tập và lưu lại tiến độ của mình nhé!
        </Text>
      </View>

      {/* Action button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={styles.loginButton}
        activeOpacity={0.8}
      >
        <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F2E2', // Giữ tông màu cũ nhưng làm sạch hơn (gần với floatingBg)
    borderRadius: 32,
    paddingVertical: 48,
    paddingHorizontal: 32,
    width: Platform.OS === 'web' ? 520 : '90%',
    maxWidth: 520,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Shadow & Border cho cảm giác cao cấp
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 12px 30px rgba(121, 108, 73, 0.15)',
        }
      : {
          shadowColor: '#796C49',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        }),
  },
  footprintDecor: {
    position: 'absolute',
    bottom: -50,
    right: -70,
    width: 320,
    height: 280,
    resizeMode: 'contain',
    opacity: 0.08,
    transform: [{ rotate: '-65deg' }],
    zIndex: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#333',
    marginTop: -4,
  },
  imageWrapper: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  bunnyImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    zIndex: 2,
  },
  bunnyGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(137, 164, 85, 0.12)',
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2A2A2A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A5A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 380,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#89A455', // Giữ màu xanh lá chủ đạo
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 24,
    minWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 6px 15px rgba(137, 164, 85, 0.3)',
        }
      : {
          shadowColor: '#89A455',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
        }),
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: 0.2,
  },
})

