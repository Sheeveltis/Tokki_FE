import React from 'react'
import { View, Text, Image } from 'react-native'

/**
 * Simple card component similar to the provided design:
 * - Square media area on top
 * - Title and description underneath
 *
 * @param {{ title: string; description?: string; imageSource?: any; style?: any }} props
 */
export const Card = ({ title, description, imageSource, style }) => {
  return (
    <View style={[{ width: 220 }, style]}>
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          backgroundColor: '#e5e5e5',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        ) : null}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 4,
            fontFamily: 'Lexend, sans-serif',
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={{
              fontSize: 15,
              color: '#555',
              lineHeight: 22,
              flexShrink: 1,
              fontFamily: 'Epilogue, sans-serif',
              textAlign: 'justify',
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

