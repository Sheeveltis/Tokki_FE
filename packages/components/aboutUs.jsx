import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import SmallFoot from '../assets/bigfoot.png'
import FacebookIcon from '../assets/facebook.png'
import GmailIcon from '../assets/gmail.png'
import TwitterIcon from '../assets/twitter.png'
import { RedBtn } from './redbtn'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export const AboutUs = ({ onReportError }) => {
  return (
    <View
      style={{
        paddingVertical: 32,
        paddingHorizontal: 24,
        gap: 32,
      }}
    >
      {/* Về chúng tôi Section */}
      <View style={{ gap: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#000',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Về chúng tôi
          </Text>
          <Image
            source={normalizeImageSource(SmallFoot)}
            style={{
                width: 60,
                height: 60,
              resizeMode: 'contain',
              right: 10,
              bottom: 10,
            }}
          />
        </View>

        {/* Dashed line */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#000',
            borderStyle: 'dashed',
            width: '100%',
          }}
        />

        <Text
          style={{
            fontSize: 14,
            color: '#000',
            fontFamily: 'Epilogue, sans-serif',
            lineHeight: 22,
            textAlign: 'left',
          }}
        >
          Tokki là nền tảng học tiếng Hàn toàn diện, kết hợp lộ trình TOPIK, Flashcard SRS,
          mini-game và công nghệ AI giúp cá nhân hóa việc học, hỗ trợ người dùng Việt chinh phục
          tiếng Hàn hiệu quả hơn mỗi ngày.
        </Text>
      </View>

      {/* Trợ Giúp Section */}
      <View style={{ gap: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#000',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          Trợ Giúp
        </Text>

        {/* Dashed line */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#000',
            borderStyle: 'dashed',
            width: '100%',
          }}
        />

        <View style={{ gap: 12 }}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 14,
                color: '#000',
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              FAQ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 14,
                color: '#000',
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              Chính sách bảo mật
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text
              style={{
                fontSize: 14,
                color: '#000',
                fontFamily: 'Epilogue, sans-serif',
              }}
            >
              Dịch vụ của chúng tôi
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Social Media Icons */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <TouchableOpacity activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(FacebookIcon)}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(GmailIcon)}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7}>
          <Image
            source={normalizeImageSource(TwitterIcon)}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Báo cáo lỗi Button */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <RedBtn onPress={onReportError}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Báo cáo lỗi
          </Text>
        </RedBtn>
      </View>
    </View>
  )
}

