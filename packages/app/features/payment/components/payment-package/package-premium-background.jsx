import React, { useState } from 'react'
import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native'
import CheckedIcon from '../../../../../assets/checked.png'
import { useRouter } from 'solito/navigation'
import { ArrowRightOutlined } from '@ant-design/icons'

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
  const { width } = useWindowDimensions()
  const isMobile = width < 600

  const handleUpgrade = () => {
    push('/premium-package')
  }

  return (
    <Pressable
      onPress={handleUpgrade}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        {
          width: '100%',
          minHeight: isMobile ? 480 : 580,
          borderRadius: 40,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: isMobile ? 24 : 40,
          paddingTop: isMobile ? 30 : 40,
          paddingBottom: isMobile ? 30 : 40,
          shadowColor: '#FF4D6D',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isHovered ? 0.25 : 0.1,
          shadowRadius: isHovered ? 30 : 20,
          elevation: isHovered ? 12 : 5,
          position: 'relative',
          borderWidth: 2,
          borderColor: isHovered ? '#FF0035' : '#FF4D6D',
          transform: [{ scale: isHovered ? 1.02 : 1 }],
          transitionProperty: 'transform, shadow-opacity, shadow-radius, border-color',
          transitionDuration: '300ms',
        },
        style,
      ]}
    >
      {/* Badge Khuyên dùng */}
      <View
        style={{
          position: 'absolute',
          top: isMobile ? -14 : -16,
          right: isMobile ? 20 : 30,
          backgroundColor: '#FF4D6D',
          paddingHorizontal: isMobile ? 12 : 20,
          paddingVertical: isMobile ? 6 : 8,
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
            fontSize: isMobile ? 10 : 11,
            fontWeight: '900',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          KHUYÊN DÙNG
        </Text>
      </View>

      {/* Icon Crown */}
      <View style={{ marginBottom: isMobile ? 15 : 25 }}>
        <View
          style={{
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: 12,
            backgroundColor: '#FFF0F3',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#FFE0E6',
          }}
        >
          <Text style={{ fontSize: isMobile ? 18 : 20 }}>👑</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* Title + subtitle */}
        <View style={{ marginBottom: isMobile ? 20 : 30 }}>
          <Text
            style={{
              fontSize: isMobile ? 24 : 28,
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
              fontSize: isMobile ? 12 : 13,
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
        <View style={{ gap: isMobile ? 16 : 20 }}>
          {benefits.map((item, index) => (
            <View
              key={`premium-benefit-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#FF4D6D',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={normalizeImageSource(CheckedIcon)}
                  style={{
                    width: 9,
                    height: 9,
                    tintColor: '#FFFFFF',
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 14 : 15,
                  color: '#4F4F4F',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '500',
                  flex: 1,
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Price Section */}
      <View style={{ alignItems: 'center', marginBottom: 20, marginTop: 20 }}>
        <Text
          style={{
            fontSize: isMobile ? 18 : 20,
            fontWeight: '900',
            color: '#FF4D6D',
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          GIÁ ƯU ĐÃI
        </Text>
        <Text
          style={{
            fontSize: isMobile ? 12 : 13,
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
      <View
        style={{
          height: isMobile ? 56 : 64,
          borderRadius: 18,
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
            fontSize: isMobile ? 16 : 18,
            fontWeight: '800',
            color: '#7B4D00',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          NÂNG CẤP NGAY
        </Text>
        <ArrowRightOutlined style={{ fontSize: isMobile ? 16 : 18, color: '#7B4D00' }} />
      </View>
    </Pressable>
  )
}
