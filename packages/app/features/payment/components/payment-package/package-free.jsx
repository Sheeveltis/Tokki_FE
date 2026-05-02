import React, { useState } from 'react'
import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native'
import CheckedIcon from '../../../../../assets/checked.png'

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
  title = 'GÓI MIỄN PHÍ',
  subtitle = 'BẠN SẼ NHẬN ĐƯỢC GÌ?',
  benefits = [
    'Giải đề TOPIK tối đa 2 đề/ngày',
    'Chơi Minigame tối đa 5 lần/ngày',
    'Giới hạn số lần sử dụng AI',
    'Sử dụng hệ thống Flashcard cơ bản',
  ],
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const { width } = useWindowDimensions()
  const isMobile = width < 600

  return (
    <Pressable
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isHovered ? 0.12 : 0.05,
          shadowRadius: isHovered ? 30 : 20,
          elevation: isHovered ? 10 : 5,
          position: 'relative',
          borderWidth: 1,
          borderColor: isHovered ? '#E0E0E0' : '#F0F0F0',
          transform: [{ scale: isHovered ? 1.02 : 1 }],
          transitionProperty: 'transform, shadow-opacity, shadow-radius, border-color',
          transitionDuration: '300ms',
        },
        style,
      ]}
    >
      {/* Icon Bolt */}
      <View style={{ marginBottom: isMobile ? 15 : 25 }}>
        <View
          style={{
            width: isMobile ? 40 : 48,
            height: isMobile ? 40 : 48,
            borderRadius: 12,
            backgroundColor: '#F8F9FB',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E8EBF1',
          }}
        >
          <Text style={{ fontSize: isMobile ? 18 : 20 }}>⚡</Text>
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
              color: '#333333',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: isMobile ? 12 : 13,
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
        <View style={{ gap: isMobile ? 16 : 20 }}>
          {benefits.map((item, index) => (
            <View
              key={`free-benefit-${index}`}
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
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={normalizeImageSource(CheckedIcon)}
                  style={{
                    width: 9,
                    height: 9,
                    tintColor: '#BDBDBD',
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

      {/* Button */}
      <View
        style={{
          height: isMobile ? 56 : 64,
          borderRadius: 18,
          backgroundColor: isHovered ? '#E8EEF4' : '#F2F6F9',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: '800',
            color: '#A0AEC0',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          ĐANG SỬ DỤNG
        </Text>
      </View>
    </Pressable>
  )
}
