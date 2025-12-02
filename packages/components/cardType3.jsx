import React from 'react'
import { View, Text, Image } from 'react-native'

/**
 * Card Type 3: Horizontal card with image on the left and text on the right.
 * Features rounded corners and beige/cream background.
 *
 * @param {{
 *  title: string;
 *  description?: string;
 *  imageSource?: any;
 *  style?: any;
 *  textContainerStyle?: any;
 *  imageContainerStyle?: any;
 *  descriptionStyle?: any;
 *  titleStyle?: any;
 * }} props
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  // If it's already an object with uri or a require result, use as is
  if (typeof src === 'number' || src.uri) return src
  // Next.js / webpack imported image: { src: 'url', ... }
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  // Plain string URL
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

export const Card = ({
  title,
  description,
  imageSource,
  style,
  textContainerStyle,
  imageContainerStyle,
  descriptionStyle,
  titleStyle,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          paddingVertical: 30,
          paddingHorizontal: 30,
          backgroundColor: '#F5F5DC', // Beige/cream background
          borderRadius: 25, // Large rounded corners
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 3,
          gap: 20,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            width: 150,
            height: 150,
            borderRadius: 0,
            overflow: 'hidden',
          },
          imageContainerStyle,
        ]}
      >
        {imageSource ? (
          <Image
            source={normalizeImageSource(imageSource)}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'cover',
            }}
          />
        ) : null}
      </View>

      <View style={[{ flex: 1, minWidth: 0 }, textContainerStyle]}>
        <Text
          style={[
            {
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 8,
              fontFamily: 'Lexend, sans-serif',
              color: '#333',
              textAlign:'center',
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              {
                fontSize: 15,
                color: '#333',
                lineHeight: 22,
                flexShrink: 1,
                fontFamily: 'Epilogue, sans-serif',
                textAlign:'center', 
              },
              descriptionStyle,
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  )
}

