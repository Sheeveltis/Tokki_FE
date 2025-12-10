import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'
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
    <View
      style={{
        backgroundColor: '#F5F0DD',
        borderRadius: 30,
        paddingVertical: 32,
        paddingHorizontal: 28,
        minWidth: 520,
        minHeight: 360,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Close button */}
      <TouchableOpacity
        onPress={handleClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 40,
          height: 40,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: '#333',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          ×
        </Text>
      </TouchableOpacity>

      {/* Footprint decoration */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={{
          position: 'absolute',
          bottom: -30,
          right: -60,
          width: 300,
          height: 250,
          resizeMode: 'contain',
          opacity: 0.1,
          transform: [{ rotate: '-60deg' }],
        }}
      />

      {/* Bunny illustration */}
      <Image
        source={normalizeImageSource(BunnyImage)}
        style={{
          width: 200,
          height: 200,
          resizeMode: 'contain',
          marginBottom: 12,
        }}
      />

      {/* Title */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: '800',
          color: '#222',
          fontFamily: 'Epilogue, sans-serif',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Đăng nhập để sử dụng tính năng này
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontSize: 15,
          color: '#555',
          fontFamily: 'Epilogue, sans-serif',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        Bạn cần đăng nhập để sử dụng tính năng này
      </Text>

      {/* Login button */}
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#89A455',
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 22,
          minWidth: 180,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        activeOpacity={0.85}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          Đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  )
}

