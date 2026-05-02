import React from 'react'
import { View, Text, Image } from 'react-native'
import CheckedIcon from '../../../../../assets/checked.png'
import LogoImage from '../../../../../assets/logo-prem.png'

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
  title = 'GÓI PREMIUM',
  subtitle = 'BẠN SẼ NHẬN ĐƯỢC QUYỀN LỢI GÌ?',
  benefits = [
    'Tất cả tính năng của gói miễn phí',
    'Mở khóa tất cả các bài học',
    'Chơi Minigame không giới hạn',
    'Sử dụng AI trong bài học không giới hạn',
    'Sở hữu huy hiệu đặc biệt & Avatar độc quyền',
  ],
  style,
}) => {
  return (
    <View
      style={[
        {
          width: 440,
          minHeight: 500,
          borderRadius: 40,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 40,
          paddingTop: 40,
          paddingBottom: 40,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          elevation: 5,
          borderWidth: 1,
          borderColor: '#F0F0F0',
        },
        style,
      ]}
    >


      <View style={{ flex: 1 }}>
        {/* Title + subtitle */}
        <View style={{ marginBottom: 40 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '900',
              fontFamily: 'Lexend, sans-serif',
              color: '#C9184A',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: '#9E9E9E',
              fontFamily: 'Lexend, sans-serif',
              letterSpacing: 0.5,
            }}
          >
            {subtitle}
          </Text>
        </View>

        {/* Benefits list */}
        <View style={{ gap: 24 }}>
          {benefits.map((item, index) => (
            <View
              key={`prem-benefit-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#00C48C', // Green as in the image
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={normalizeImageSource(CheckedIcon)}
                  style={{
                    width: 12,
                    height: 12,
                    tintColor: '#FFFFFF',
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 16,
                  color: '#1A1A1A',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: '600',
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

    </View>
  )
}
