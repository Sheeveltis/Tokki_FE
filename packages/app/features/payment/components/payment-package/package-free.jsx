import React, { useState } from 'react'
import { View, Text, Image, Pressable } from 'react-native'
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
          elevation: 5,
          position: 'relative',
          borderWidth: 1,
          borderColor: '#F0F0F0',
        },
        style,
      ]}
    >
      {/* Icon Bolt */}
      <View style={{ marginBottom: 25 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: '#F8F9FB',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#E8EBF1',
          }}
        >
          <Text style={{ fontSize: 20 }}>⚡</Text>
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
              color: '#333333',
              marginBottom: 4,
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
        <View style={{ gap: 20 }}>
          {benefits.map((item, index) => (
            <View
              key={`free-benefit-${index}`}
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
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={normalizeImageSource(CheckedIcon)}
                  style={{
                    width: 10,
                    height: 10,
                    tintColor: '#BDBDBD',
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

      {/* Button */}
      <Pressable
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={{
          height: 64,
          borderRadius: 20,
          backgroundColor: isHovered ? '#E8EEF4' : '#F2F6F9',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '800',
            color: '#A0AEC0',
            fontFamily: 'Lexend, sans-serif',
            letterSpacing: 1,
          }}
        >
          ĐANG SỬ DỤNG
        </Text>
      </Pressable>
    </View>
  )
}
