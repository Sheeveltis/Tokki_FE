import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo.png'
import BigFoot from '../assets/bigfoot.png'
import HomeIcon from '../assets/icon/icon-mainflow/home.svg'
import RoadmapIcon from '../assets/roadmap.png'
import FlashcardIcon from '../assets/icon/icon-mainflow/bookmark.svg'
import BlogIcon from '../assets/icon/icon-mainflow/say.svg'
import SmallFoot from '../assets/smallfoot.png'
import { useRouter } from 'solito/navigation'
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
 * Navbar component with Tokki branding and navigation
 * 
 * @param {{
 *   logoImage?: any;
 *   pawPrintImage?: any;
 *   homeIcon?: any;
 *   roadmapIcon?: any;
 *   flashcardIcon?: any;
 *   blogIcon?: any;
 *   profileIcon?: any;
 *   onHomePress?: () => void;
 *   onRoadmapPress?: () => void;
 *   onFlashcardPress?: () => void;
 *   onBlogPress?: () => void;
 *   onLoginPress?: () => void;
 *   onRegisterPress?: () => void;
 *   style?: any;
 * }} props
 */
export const Navbar = ({
  homeIcon,
  roadmapIcon,
  flashcardIcon,
  blogIcon,
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onLoginPress,
  onRegisterPress,
  style,
}) => {
  const router = useRouter()

  // Handler functions với fallback routing
  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress()
    } else {
      router.push('/homepage')
    }
  }

  const handleRoadmapPress = () => {
    if (onRoadmapPress) {
      onRoadmapPress()
    } else {
      router.push('/roadmap')
    }
  }

  const handleFlashcardPress = () => {
    if (onFlashcardPress) {
      onFlashcardPress()
    } else {
      router.push('/flashcard')
    }
  }

  const handleBlogPress = () => {
    if (onBlogPress) {
      onBlogPress()
    } else {
      router.push('/blog')
    }
  }

  const handleLoginPress = () => {
    if (onLoginPress) {
      onLoginPress()
    } else {
      router.push('/login')
    }
  }

  const handleRegisterPress = () => {
    if (onRegisterPress) {
      onRegisterPress()
    } else {
      router.push('/register')
    }
  }

  return (
    <View
      style={[
        {
          width: '100%',
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          backgroundColor: '#FFF8E7',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* Background image with 50% opacity */}
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
      
      {/* Left section: Logo */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          zIndex: 1,
        }}
      >
        <Image
          source={normalizeImageSource(LogoImage)}
          style={{
            width: 60,
            height: 60,
            resizeMode: 'contain',
          }}
        />
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            color: '#FFDC9C',
            fontFamily: 'Epilogue, sans-serif',
            letterSpacing: 0.5,
          }}
        >
          Tokki
        </Text>
        <Image
          source={normalizeImageSource(BigFoot)}
          style={{
            width: 60,
            height: 60,
            resizeMode: 'contain',
            right: 20,
            bottom: 20,
          }}
        />
      </View>

      {/* Small foot decoration in top right corner */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={{
          position: 'absolute',
          top: -5,
          right: 100,
          width: 200,
          height: 150,
          resizeMode: 'contain',
          opacity: 0.5,
          transform: [{ rotate: '-10deg' }],
        }}
      />

      {/* Center section: Navigation items */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 32,
          zIndex: 1,
        }}
      >
        {/* Trang Chủ */}
        <TouchableOpacity
          onPress={handleHomePress}
          style={{
            alignItems: 'center',
          }}
        >
          <Image
            source={normalizeImageSource(homeIcon || HomeIcon)}
            style={{
              width: 40,
              height: 40,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              top: 11,
              fontSize: 15,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Trang Chủ
          </Text>
        </TouchableOpacity>

        {/* Lộ Trình */}
        <TouchableOpacity
          onPress={handleRoadmapPress}
          style={{
            alignItems: 'center',
          }}
        >
          <Image
            source={normalizeImageSource(roadmapIcon || RoadmapIcon)}
            style={{
              width: 65,
              height: 62,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Lộ Trình
          </Text>
        </TouchableOpacity>

        {/* Flashcard */}
        <TouchableOpacity
          onPress={handleFlashcardPress}
          style={{
            alignItems: 'center',
          }}
        >
          <Image
            source={normalizeImageSource(flashcardIcon || FlashcardIcon)}
            style={{
              width: 45,
              height: 60,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Flashcard
          </Text>
        </TouchableOpacity>

        {/* Blog */}
        <TouchableOpacity
          onPress={handleBlogPress}
          style={{
            alignItems: 'center',
          }}
        >
          <Image
            source={normalizeImageSource(blogIcon || BlogIcon)}
            style={{
              width: 40,
              height: 60,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 15,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Blog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right section: Login and Register buttons */}
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          zIndex: 1,
        }}
      >
        {/* Đăng Nhập button */}
        <TouchableOpacity
          onPress={handleLoginPress}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: '#8B9A6B',
            borderWidth: 2,
            borderColor: '#4A90E2',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 120,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Đăng Nhập
          </Text>
        </TouchableOpacity>

        {/* Đăng Ký button */}
        <TouchableOpacity
          onPress={handleRegisterPress}
          style={{
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 20,
            backgroundColor: '#6B7A4B',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 120,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#FFFFFF',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Đăng Ký
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

