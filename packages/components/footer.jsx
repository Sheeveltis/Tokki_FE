import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'

import BackgroundImage from '../assets/background1.png'
import BunnySticker from '../assets/bunny/3.png'
import FacebookIcon from '../assets/facebook.png'
import GmailIcon from '../assets/gmail.png'
import TwitterIcon from '../assets/twitter.png'

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

export const Footer = ({ style }) => {
  const studyLinks = ['Lộ trình', 'Sổ tay từ vựng', 'Flashcard', 'Blog']
  const helpLinks = ['FAQ', 'Chính sách bảo mật', 'Dịch vụ của chúng tôi']

  return (
    <View
      style={[
        {
          width: '100%',
          paddingHorizontal: 32,
          paddingVertical: 32,
          backgroundColor: '#FFF8E7',
          position: 'relative',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          opacity: 0.45,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
          zIndex: 1,
        }}
      >
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              fontFamily: 'Epilogue, sans-serif',
              color: '#111',
              paddingBottom: 8,
              borderBottomWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#222',
              marginBottom: 10,
            }}
          >
            Về chúng tôi
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: '#111',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Tokki là nền tảng học tiếng Hàn toàn diện, kết hợp lộ trình TOPIK,
            Flashcard SRS, mini-game và công nghệ AI giúp cá nhân hoá việc học,
            hỗ trợ người dùng Việt chinh phục tiếng Hàn hiệu quả hơn mỗi ngày.
          </Text>
        </View>

        <View style={{ minWidth: 150 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              fontFamily: 'Epilogue, sans-serif',
              color: '#111',
              paddingBottom: 8,
              borderBottomWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#222',
              marginBottom: 10,
            }}
          >
            Học Tập
          </Text>
          <View style={{ gap: 6 }}>
            {studyLinks.map((item) => (
              <Text
                key={item}
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#111',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>

        <View style={{ minWidth: 150 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              fontFamily: 'Epilogue, sans-serif',
              color: '#111',
              paddingBottom: 8,
              borderBottomWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: '#222',
              marginBottom: 10,
            }}
          >
            Trợ Giúp
          </Text>
          <View style={{ gap: 6 }}>
            {helpLinks.map((item) => (
              <Text
                key={item}
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#111',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                {item}
              </Text>
            ))}
          </View>
        </View>

        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 140,
            gap: 16,
          }}
        >
          <Image
            source={normalizeImageSource(BunnySticker)}
            style={{
              width: 110,
              height: 110,
              resizeMode: 'contain',
            }}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {[
              { key: 'facebook', icon: FacebookIcon },
              { key: 'gmail', icon: GmailIcon },
              { key: 'twitter', icon: TwitterIcon },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: item.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                  padding: 4,
                }}
              >
                <Image
                  source={normalizeImageSource(item.icon)}
                  style={{
                    width: 24,
                    height: 24,
                    resizeMode: 'contain',
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}


