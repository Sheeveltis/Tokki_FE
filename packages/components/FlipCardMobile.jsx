import React from 'react'
import { View, Text, Image, Pressable, Animated } from 'react-native'
import SoundIcon from '../assets/icon/icon-mainflow/sound.svg'

// Utility function để normalize image source cho React Native
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  // Xử lý object có src property (SVG component thường có)
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  // Xử lý object có default property (một số bundler wrap SVG như vậy)
  if (typeof src === 'object' && src.default) {
    const defaultSrc = src.default
    if (typeof defaultSrc === 'string') {
      return { uri: defaultSrc }
    }
    if (typeof defaultSrc === 'object' && defaultSrc.src) {
      return { uri: defaultSrc.src }
    }
    if (typeof defaultSrc === 'object' && defaultSrc.uri) {
      return { uri: defaultSrc.uri }
    }
    return defaultSrc
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  // Trả về nguyên bản nếu không xử lý được
  return src
}

/**
 * Component FlipCardMobile - Flashcard với animation flip cho mobile (React Native)
 * 
 * @param {{
 *   // Flashcard mode (ưu tiên)
 *   word?: string; - Từ vựng hiển thị mặt trước
 *   meaning?: string; - Nghĩa hiển thị mặt sau
 *   image?: string | { uri: string } | React.ReactNode; - Hình ảnh hiển thị trên mặt sau (cùng với nghĩa)
 *   
 *   // Custom content mode (nếu không có word/meaning)
 *   frontContent?: React.ReactNode; - Nội dung mặt trước (custom)
 *   backContent?: React.ReactNode; - Nội dung mặt sau (custom)
 *   
 *   width?: number | string; - Chiều rộng (mặc định 300px)
 *   height?: number | string; - Chiều cao (mặc định 200px)
 *   frontColor?: string; - Màu nền mặt trước (mặc định #6A2C70)
 *   backColor?: string; - Màu nền mặt sau (mặc định #F08A5D)
 *   borderWidth?: number; - Độ dày border (mặc định 10px)
 *   borderRadius?: number; - Border radius (mặc định 10px)
 *   isFlipped?: boolean; - Control flip từ bên ngoài (optional)
 *   onFlip?: (flipped: boolean) => void; - Callback khi flip
 *   starIcon?: React.ReactNode | string; - Icon star để hiển thị ở góc trên phải
 *   isFavorite?: boolean; - Trạng thái yêu thích
 *   onToggleFavorite?: () => void; - Callback khi click vào star
 *   onPlaySound?: () => void; - Callback khi click vào icon sound
 *   style?: object; - Custom styles
 * }} props
 */
export function FlipCardMobile({
  word,
  meaning,
  image,
  frontContent,
  backContent,
  width = 300,
  height = 200,
  frontColor = '#6A2C70',
  backColor = '#F08A5D',
  borderWidth = 10,
  borderRadius = 10,
  isFlipped: controlledFlipped,
  onFlip,
  starIcon,
  isFavorite = false,
  onToggleFavorite,
  onPlaySound,
  style,
}) {
  const [internalFlipped, setInternalFlipped] = React.useState(false)
  
  // Sử dụng controlled state nếu có, nếu không dùng internal state
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped

  const handleFlip = () => {
    const newFlippedState = !isFlipped
    if (controlledFlipped === undefined) {
      setInternalFlipped(newFlippedState)
    }
    if (onFlip) {
      onFlip(newFlippedState)
    }
  }

  // Xử lý width và height - có thể là number hoặc string (như "100%")
  const widthValue = width
  const heightValue = height

  // Animation cho flip
  const flipAnimation = React.useRef(new Animated.Value(isFlipped ? 1 : 0)).current

  React.useEffect(() => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isFlipped, flipAnimation])

  // Sử dụng Animated.Value để tạo fade animation mượt
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const frontAnimatedStyle = {
    opacity: frontOpacity,
  }

  const backAnimatedStyle = {
    opacity: backOpacity,
  }

  // Render flashcard content nếu có word/meaning
  const renderFlashcardContent = () => {
    // Nếu có custom content, ưu tiên custom content
    if (frontContent || backContent) {
      return {
        front: frontContent,
        back: backContent,
      }
    }
    
    // Nếu có word, meaning, hoặc image, render flashcard mode
    const hasWord = word !== undefined
    const hasMeaning = meaning !== undefined
    const hasImage = image !== undefined && image !== null
    
    if (hasWord || hasMeaning || hasImage) {
      // Flashcard mode
      const imageSrc = typeof image === 'string' 
        ? image 
        : (image && typeof image === 'object' && image.uri) 
          ? image.uri 
          : null

      return {
        // Mặt trước: chỉ hiển thị từ (word)
        front: (
          <View style={{ 
            flex: 1,
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 20,
            width: '100%',
            height: '100%',
          }}>
            {word && (
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700',
                textAlign: 'center',
                color: '#fff',
              }}>
                {word}
              </Text>
            )}
          </View>
        ),
        // Mặt sau: hình + nghĩa
        back: (
          <View style={{ 
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 20,
            width: '100%',
            height: '100%',
          }}>
            {image && (
              <View style={{ 
                marginBottom: meaning ? 16 : 0,
                maxWidth: '80%',
                maxHeight: '60%',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {typeof image === 'string' || (image && image.uri) ? (
                  <Image 
                    source={{ uri: imageSrc }} 
                    style={{ 
                      width: 400, 
                      height: 300, 
                      resizeMode: 'cover',
                      borderRadius: 8,
                    }} 
                  />
                ) : (
                  image
                )}
              </View>
            )}
            {meaning && (
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '600',
                textAlign: 'center',
                color: '#fff',
              }}>
                {meaning}
              </Text>
            )}
          </View>
        ),
      }
    }
    
    // Fallback: trả về empty content nếu không có dữ liệu
    return {
      front: <View style={{ width: '100%', height: '100%' }} />,
      back: <View style={{ width: '100%', height: '100%' }} />,
    }
  }

  const content = renderFlashcardContent()

  // Kiểm tra xem icon có phải là React component không (SVG component)
  const isReactComponent = (icon) => {
    if (!icon) return false
    return (
      (typeof icon === 'function') || 
      (typeof icon === 'object' && icon.$$typeof) ||
      (typeof icon === 'object' && icon.default && (typeof icon.default === 'function' || icon.default.$$typeof))
    )
  }

  // Render sound icon nếu có
  const renderSoundIcon = () => {
    // Hiển thị icon sound khi có onPlaySound
    if (!onPlaySound) return null

    // Kiểm tra xem SoundIcon có phải là React component không (SVG component trên mobile)
    const isComponent = isReactComponent(SoundIcon)
    
    const iconButtonStyle = {
      position: 'absolute',
      top: 8,
      right: starIcon && onToggleFavorite ? 52 : 8,
      zIndex: 10,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    }

    const iconContainerStyle = {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    }

    const handlePress = (e) => {
      if (e?.stopPropagation) {
        e.stopPropagation()
      }
      if (onPlaySound) {
        onPlaySound()
      }
    }

    // Nếu là React component (SVG component), render trực tiếp
    if (isComponent) {
      const IconComponent = typeof SoundIcon === 'function' ? SoundIcon : (SoundIcon.default || SoundIcon)
      return (
        <Pressable
          style={iconButtonStyle}
          onPress={handlePress}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <View style={[iconContainerStyle, { opacity: 0.5 }]}>
            <IconComponent width={28} height={28} />
          </View>
        </Pressable>
      )
    }

    // Nếu không phải component, thử dùng Image với normalizeImageSource
    const normalizedSoundIcon = normalizeImageSource(SoundIcon)
    if (!normalizedSoundIcon) return null

    const imageSource = normalizedSoundIcon
      
    return (
      <Pressable
        style={iconButtonStyle}
        onPress={handlePress}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <View style={iconContainerStyle}>
          <Image
            source={imageSource}
            style={{
              width: 28,
              height: 28,
              opacity: 0.5,
            }}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    )
  }

  // Render star icon nếu có
  const renderStarIcon = () => {
    if (!starIcon || !onToggleFavorite) return null

    // Kiểm tra xem starIcon có phải là React component không (SVG component trên mobile)
    const isComponent = isReactComponent(starIcon)

    const iconButtonStyle = {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 10,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    }

    const iconContainerStyle = {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    }

    const handlePress = (e) => {
      if (e?.stopPropagation) {
        e.stopPropagation()
      }
      onToggleFavorite()
    }

    // Nếu là React component (SVG component), render trực tiếp
    if (isComponent) {
      const IconComponent = typeof starIcon === 'function' ? starIcon : (starIcon.default || starIcon)
      return (
        <Pressable
          style={iconButtonStyle}
          onPress={handlePress}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <View style={[iconContainerStyle, { opacity: isFavorite ? 1 : 0.5 }]}>
            <IconComponent 
              width={28} 
              height={28} 
              fill={isFavorite ? '#F1BE4B' : undefined}
            />
          </View>
        </Pressable>
      )
    }

    // Nếu không phải component, thử dùng Image với normalizeImageSource
    // starIcon đã được normalize từ component cha (normalizeImageSource(StarIcon))
    let imageSource = starIcon
    
    // Nếu starIcon là object nhưng không có uri (chưa được normalize đúng cách)
    if (starIcon && typeof starIcon === 'object' && !starIcon.uri && !starIcon.src) {
      // Thử normalize lại
      const normalized = normalizeImageSource(starIcon)
      if (normalized) {
        imageSource = normalized
      } else {
        // Nếu không normalize được, thử extract src/uri/default
        const starSrc = starIcon.src || starIcon.uri || (starIcon.default?.src || starIcon.default?.uri)
        if (starSrc) {
          imageSource = typeof starSrc === 'string' ? { uri: starSrc } : starSrc
        } else {
          return null
        }
      }
    } else if (typeof starIcon === 'string') {
      // Nếu là string, convert sang { uri: string }
      imageSource = { uri: starIcon }
    }
    
    // Kiểm tra xem imageSource có hợp lệ không
    if (!imageSource || (typeof imageSource === 'object' && !imageSource.uri && typeof imageSource !== 'number')) {
      return null
    }
        
    return (
      <Pressable
        style={iconButtonStyle}
        onPress={handlePress}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
      >
        <View style={iconContainerStyle}>
          <Image
            source={imageSource}
            style={{
              width: 28,
              height: 28,
              opacity: isFavorite ? 1 : 0.5,
              tintColor: isFavorite ? '#F1BE4B' : undefined,
            }}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    )
  }

  return (
    <Pressable
      style={[
        {
          width: widthValue,
          height: heightValue,
          borderRadius: borderRadius,
          position: 'relative',
        },
        style,
      ]}
      onPress={() => {
        handleFlip()
      }}
      activeOpacity={0.9}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: frontColor,
            borderWidth: borderWidth,
            borderColor: frontColor,
            borderRadius: borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          },
          frontAnimatedStyle,
        ]}
        pointerEvents={isFlipped ? 'none' : 'auto'}
      >
        {content?.front || null}
        {renderSoundIcon()}
        {renderStarIcon()}
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: backColor,
            borderWidth: borderWidth,
            borderColor: backColor,
            borderRadius: borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          },
          backAnimatedStyle,
        ]}
        pointerEvents={isFlipped ? 'auto' : 'none'}
      >
        {content?.back || null}
        {renderSoundIcon()}
        {renderStarIcon()}
      </Animated.View>
    </Pressable>
  )
}

export default FlipCardMobile
