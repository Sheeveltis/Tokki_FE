import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import BackgroundImage from '../assets/background1.png'
import LogoImage from '../assets/logo.png'
import BigFoot from '../assets/bigfoot.png'
import HomeIcon from '../assets/homepage.png'
import RoadmapIcon from '../assets/roadmap.png'
import FlashcardIcon from '../assets/flashcard.png'
import BlogIcon from '../assets/blog.png'
import ProfileIcon from '../assets/user.png'
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
 *   onProfilePress?: () => void;
 *   style?: any;
 * }} props
 */
export const Navbar = ({
  logoImage,
  pawPrintImage,
  homeIcon,
  roadmapIcon,
  flashcardIcon,
  blogIcon,
  profileIcon,
  onHomePress,
  onRoadmapPress,
  onFlashcardPress,
  onBlogPress,
  onProfilePress,
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

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress()
    } else {
      router.push('/profile')
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
          opacity: 0.5,
        }}
      />

      {/* Small foot decoration in top right corner */}
      <Image
        source={normalizeImageSource(SmallFoot)}
        style={{
          position: 'absolute',
          top: -20,
          right: -50,
          width: 200,
          height: 150,
          resizeMode: 'contain',
          opacity: 0.5,
          transform: [{ rotate: '-70deg' }],
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
            fontSize: 28,
            fontWeight: '600',
            color: '#FFB84D',
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
          }}
        />
      </View>

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
              width: 70,
              height: 50,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
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
              width: 30,
              height: 50,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
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
              width: 30,
              height: 50,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
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
              width: 30,
              height: 50,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: '#333',
              fontFamily: 'Epilogue, sans-serif',
            }}
          >
            Blog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right section: Greeting and Profile */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          zIndex: 1,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: '#333',
            fontFamily: 'Epilogue, sans-serif',
          }}
        >
          안녕하세요
        </Text>
        <TouchableOpacity
          onPress={handleProfilePress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFB84D',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={normalizeImageSource(profileIcon || ProfileIcon)}
            style={{
              width: 50,
              height: 50,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

