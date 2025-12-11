import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useRouter } from 'solito/navigation'
import BunnyImage from '../assets/bunny/5.png'
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
 * notiContinueLesson: nhắc tiếp tục làm bài, có nút tiếp tục & thoát
 */
export const NotiContinueLesson = ({ onClose, onContinue, onExit }) => {
  const router = useRouter()

  const handleClose = () => {
    if (onClose) onClose()
  }

  const handleContinue = () => {
    if (onContinue) onContinue()
  }

  const handleExit = () => {
    if (onExit) {
      onExit()
    } else {
      router.back()
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
          fontSize: 20,
          fontWeight: '800',
          color: '#222',
          fontFamily: 'Epilogue, sans-serif',
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Làm nốt bài đi bạn ơi!!! Thoát bây giờ là toàn bộ
        {'\n'}kết quả học không được lưu lại đóooo🥹
      </Text>

      {/* Buttons */}
      <View
        style={{
          rowGap: 10,
          width: '100%',
          alignItems: 'center',
          marginTop: 6,
        }}
      >
        <TouchableOpacity
          onPress={handleContinue}
          style={{
            backgroundColor: '#8C2C32',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 22,
            minWidth: 200,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
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
            Làm bài tiếp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExit}
          style={{
            backgroundColor: '#B0AFAF',
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 22,
            minWidth: 200,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 3,
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
            Thoát
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

