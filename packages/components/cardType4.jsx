import React from 'react'
import { View, Text, Image } from 'react-native'
import CheckedIcon from '../assets/checked.png'
import IncorrectIcon from '../assets/incorrect.png'

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
 * Card Type 4: Vertical pricing card
 * - Tall card with background image
 * - Centered title and subtitle
 * - Bullet list of benefits
 * - Bunny image bottom-right
 * - Price label bottom-left
 *
 * @param {{
 *   title: string;
 *   subtitle?: string;
 *   benefits?: string[];
 *   priceLabel?: string;
 *   imageSource?: any;
 *   backgroundImageSource?: any;
 *   style?: any;
 * }} props
 */
export const Card = ({
  title,
  subtitle,
  benefits = [],
  priceLabel,
  imageSource,
  backgroundImageSource,
  style,
}) => {
  return (
    <View
      style={{
        width: 400,
        height: 500,
        borderRadius: 32,
        backgroundColor: '#FFF3D9',
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
        ...style,
      }}
    >
      {backgroundImageSource ? (
        <Image
          source={normalizeImageSource(backgroundImageSource)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
            opacity: 0.35,
          }}
        />
      ) : null}

      <View style={{ zIndex: 1, flex: 1 }}>
        {/* Title + subtitle */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 34,
              fontWeight: '800',
              fontFamily: 'Lexend, sans-serif',
              color: '#222',
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                marginTop: 4,
                fontSize: 14,
                color: '#555',
                fontFamily: 'Epilogue, sans-serif',
                textAlign: 'center',
              }}
            >
              {subtitle}
            </Text>
          ) : null}
          <View
            style={{
              width: '90%',
              height: 1.25,
              marginTop: 12,
              backgroundColor: '#E8D6B5',
            }}
          />
        </View>

        {/* Benefits list */}
        <View style={{ gap: 15, paddingRight: 8 }}>
          {benefits.map((item, index) => (
            <View
              key={`${item.label}-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Image
                source={
                  item.type === 'invalid'
                    ? normalizeImageSource(IncorrectIcon)
                    : normalizeImageSource(CheckedIcon)
                }
                style={{
                  width: 20,
                  height: 20,
                  tintColor: item.type === 'invalid' ? '#E35345' : '#3A8F44',
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
                {item.label || item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        style={{
          flex: 1,
          marginTop: 8,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          zIndex: 1,
        }}
      >
        {imageSource ? (
          <Image
            source={normalizeImageSource(imageSource)}
            style={{
              width: 220,
              height: 220,
              resizeMode: 'contain',
              marginRight: -20,
            }}
          />
        ) : null}
      </View>

      {priceLabel ? (
        <View
          style={{
            position: 'absolute',
            left: 20,
            bottom: 20,
            zIndex: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              fontFamily: 'Lexend, sans-serif',
              color: '#222',
            }}
          >
            {priceLabel}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
