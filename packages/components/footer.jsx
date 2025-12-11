import React from 'react'
import { View, Image } from 'react-native'

import BackgroundImage from '../assets/background1.png'
import { AboutUs } from './aboutUs'
import { ContactForm } from './contactForm'

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

export const Footer = ({ style, onReportError, onContactSubmit }) => {
  return (
    <View
      style={[
        {
          width: '100%',
          paddingHorizontal: 130,
          paddingVertical: 20,
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
          opacity: 0.3,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 48,
          zIndex: 1,
        }}
      >
        {/* Left Section - AboutUs */}
        <View style={{ flex: 1, maxWidth: '50%' }}>
          <AboutUs onReportError={onReportError} />
        </View>

        {/* Right Section - ContactForm */}
        <View
          style={{
            flex: 1,
            maxWidth: '50%',
            top: 40,
          }}
        >
          <ContactForm onSubmit={onContactSubmit} />
        </View>
      </View>
    </View>
  )
}


