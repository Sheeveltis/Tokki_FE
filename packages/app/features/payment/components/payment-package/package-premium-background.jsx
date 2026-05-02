import React, { useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import CheckedIcon from '../../../../../assets/checked.png'
import { useRouter } from 'solito/navigation'

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

export const Card = ({
  title = 'GÓI PREMIUM ★',
  subtitle = 'BỨT PHÁ MỌI GIỚI HẠN',
  benefits = [
    'Tất cả tính năng của gói miễn phí',
    'Mở khóa tất cả các bài học',
    'Chơi Minigame không giới hạn',
    'Sử dụng AI trong bài học không giới hạn',
    'Sở hữu huy hiệu đặc biệt & Avatar độc quyền',
  ],
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const { push } = useRouter()

  const handleUpgrade = () => {
    push('/premium-package')
  }

  return (
    <View
      style={[
        {
          width: '100%',
          minHeight: 580,
          borderRadius: 40,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 40,
          paddingTop: 40,
          paddingBottom: 40,
          shadowColor: '#FF4D6D',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
          position: 'relative',
          borderWidth: 2,
          borderColor: '#FF4D6D',
        },
        style,
      ]}
    >
      {/* Badge Khuyên dùng */}
      <View
        style={{
          position: 'absolute',
          top: -16,
          right: 30,
          backgroundColor: '#FF4D6D',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderRadius: 100,
          shadowColor: '#FF4D6D',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          zIndex: 10,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: '900',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          KHUYÊN DÙNG
        </Text>
      </View>

      {/* Icon Crown */}
      <View style={{ marginBottom: 25 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#FFF0F3',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#FFE0E6',
          }}
        >
          <Text style={{ fontSize: 20 }}>👑</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* Title + subtitle */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              fontFamily: 'Lexend, sans-serif',
              color: '#C9184A',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: '#FF4D6D',
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: 0.5,
            }}
          >
            {subtitle}
          </Text>
        </View>

        {/* Benefits list */}
        <View style={{ gap: 20 }}>
          {benefits.map((item, index) => (
            <View
              key={`premium-benefit-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#FF4D6D',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={normalizeImageSource(CheckedIcon)}
                  style={{
                    width: 10,
                    height: 10,
                    tintColor: '#FFFFFF',
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 15,
                  color: '#4F4F4F',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '500',
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price Section */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '900',
            color: '#FF4D6D',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          GIÁ ƯU ĐÃI
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: '#FF4D6D',
            fontFamily: 'Lexend, sans-serif',
            fontStyle: 'italic',
          }}
        >
          Chỉ từ 2k/ngày
        </Text>
      </View>

      {/* Button */}
      <Pressable
        onPress={handleUpgrade}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={{
          height: 64,
          borderRadius: 20,
          backgroundColor: isHovered ? '#FFCA3D' : '#FFB703',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 10,
          shadowColor: '#FFB703',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          cursor: 'pointer',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#7B4D00',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          NÂNG CẤP NGAY
        </Text>
        <Text style={{ fontSize: 18, color: '#7B4D00' }}>→</Text>
      </Pressable>
    </View>
  )
}
