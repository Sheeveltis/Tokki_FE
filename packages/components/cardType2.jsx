import React from 'react'
import { View, Text, Image } from 'react-native'

/**
 * Horizontal card with rectangular media on the left and text content on the right.
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
          alignItems: 'flex-start',
          padding: 16,
          backgroundColor: '#fff',
          borderRadius: 8,
          shadowColor: '#00000020',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          gap: 16,
        },
        style,
      ]}
    >
      <View
        style={[
          {
            width: 200,
            height: 120,
            borderRadius: 0,
            backgroundColor: '#e5e5e5',
            overflow: 'hidden',
          },
          imageContainerStyle,
        ]}
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

      <View style={[{ flex: 1, minWidth: 0 }, textContainerStyle]}>
        <Text
          style={[
            {
              fontSize: 20,
              fontWeight: '700',
              marginBottom: 4,
              fontFamily: 'Lexend, sans-serif',
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
                color: '#555',
                lineHeight: 22,
                flexShrink: 1,
                fontFamily: 'Epilogue, sans-serif',
                textAlign: 'justify',
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


