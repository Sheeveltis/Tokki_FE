import React from 'react'
import { View, Text, Image } from 'react-native'
import CheckedIcon from '../../../../../assets/checked.png'
import BackgroundImage from '../../../../../assets/background1.png'
import LogoImage from '../../../../../assets/logo-prem.png'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
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
 * Card Type 5: Premium Package Card
 * - Background with carrots pattern (background1.png)
 * - Large red title "GÓI PREMIUM"
 * - Subtitle question
 * - Dashed line separator
 * - List of benefits with checkmarks
 * - Rabbit logo (logo.png) bottom-right
 * - Price label bottom-left
 *
 * @param {{
 *   title?: string;
 *   subtitle?: string;
 *   benefits?: string[];
 *   priceLabel?: string;
 *   style?: any;
 * }} props
 */
export const Card = ({
  title = 'GÓI PREMIUM',
  subtitle = 'Bạn sẽ nhận được quyền lợi gì ?',
  benefits = [
    'Tất cả các tính năng của gói miễn phí',
    'Mở khóa tất cả các bài học',
    'Chơi Minigame không giới hạn',
    'Sử dụng AI trong các bài học không giới hạn',
    'Sở hữu huy hiệu đặc biệt',
  ],
  style,
}) => {
  return (
    <View
      style={[
        {
          width: 400,
          height: 500,
          borderRadius: 32,
          backgroundColor: '#FFE4B5', // Light creamy orange background
          paddingHorizontal: 30,
          paddingTop: 24,
          paddingBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.16,
          shadowRadius: 8,
          elevation: 4,
          overflow: 'hidden',
          position: 'relative',
        },
        style,
      ]}
    >
      {/* Background image */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          opacity: 0.4,
        }}
      />

      <View style={{ zIndex: 1, flex: 1 }}>
        {/* Title */}
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              fontFamily: 'Lexend, sans-serif',
              color: '#DC143C', // Red color
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
        </View>

        {/* Subtitle */}
        {subtitle ? (
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 16,
                color: '#555',
                fontFamily: 'Epilogue, sans-serif',
                textAlign: 'center',
                fontWeight: '400',
              }}
            >
              {subtitle}
            </Text>
          </View>
        ) : null}

        {/* Dashed line separator */}
        <View
          style={{
            width: '90%',
            alignSelf: 'center',
            height: 1.5,
            marginBottom: 16,
            borderTopWidth: 1.5,
            borderTopColor: '#333',
            borderStyle: 'dashed',
          }}
        />

        {/* Benefits list */}
        <View style={{ gap: 12, paddingRight: 8 }}>
          {benefits.map((item, index) => (
            <View
              key={`benefit-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <Image
                source={normalizeImageSource(CheckedIcon)}
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 2,
                  tintColor: '#3A8F44',
                }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  lineHeight: 20,
                  color: '#333',
                  fontFamily: 'Epilogue, sans-serif',
                }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rabbit logo bottom-right */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          zIndex: 2,
        }}
      >
        <Image
          source={normalizeImageSource(LogoImage)}
          style={{
            width: 210,
            height: 210,
            resizeMode: 'contain',
            left: 20,
            top: 10,
          }}
        />
      </View>

    </View>
  )
}


