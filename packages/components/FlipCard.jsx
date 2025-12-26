import React from 'react'
import { Platform, View, Text, Image, Pressable, StyleSheet, Animated } from 'react-native'
import SoundIcon from '../assets/icon/icon-mainflow/sound.svg'

/**
 * Component FlipCard - Flashcard với animation flip 3D
 * 
 * @param {{
 *   // Flashcard mode (ưu tiên)
 *   word?: string; - Từ vựng hiển thị mặt trước
 *   meaning?: string; - Nghĩa hiển thị mặt sau
 *   image?: string | { uri: string } | React.ReactNode; - Hình ảnh hiển thị trên mặt trước
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
 *   flipOnHover?: boolean; - Flip khi hover (mặc định true)
 *   isFlipped?: boolean; - Control flip từ bên ngoài (optional)
 *   onFlip?: (flipped: boolean) => void; - Callback khi flip
 *   starIcon?: React.ReactNode | string; - Icon star để hiển thị ở góc trên phải
 *   isFavorite?: boolean; - Trạng thái yêu thích
 *   onToggleFavorite?: () => void; - Callback khi click vào star
 *   onPlaySound?: () => void; - Callback khi click vào icon sound
 *   className?: string; - Custom className
 *   style?: React.CSSProperties; - Custom styles
 * }} props
 */
export function FlipCard({
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
  flipOnHover = false,
  flipDirection = 'x', // 'y' = lật ngang, 'x' = lật dọc
  isFlipped: controlledFlipped,
  onFlip,
  starIcon,
  isFavorite = false,
  onToggleFavorite,
  onPlaySound,
  className = '',
  style,
}) {
  const [internalFlipped, setInternalFlipped] = React.useState(false)
  
  // Sử dụng controlled state nếu có, nếu không dùng internal state
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped

  // Inject style vào DOM chỉ trên web (tránh lỗi React Native parse JSX <style>)
  React.useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'flip-card-styles'
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style')
        styleElement.id = styleId
        styleElement.textContent = `
          .flip-card-hover:hover .flip-card-inner {
            transform: rotateY(180deg) !important;
          }
          .flip-card-clickable {
            cursor: pointer;
          }
        `
        document.head.appendChild(styleElement)
      }
      return () => {
        const styleEl = document.getElementById(styleId)
        if (styleEl) {
          document.head.removeChild(styleEl)
        }
      }
    }
  }, [])

  const handleFlip = () => {
    if (controlledFlipped === undefined) {
      setInternalFlipped(!internalFlipped)
    }
    if (onFlip) {
      onFlip(!isFlipped)
    }
  }

  // Animation cho native - sử dụng opacity và scale vì React Native không hỗ trợ backfaceVisibility
  const flipAnimation = React.useRef(new Animated.Value(isFlipped ? 1 : 0)).current

  React.useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 1 : 0,
      useNativeDriver: true,
      tension: 10,
      friction: 8,
    }).start()
  }, [isFlipped])

  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  })

  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  const scale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.8, 1],
  })

  const widthValue = typeof width === 'number' ? width : (Platform.OS === 'web' ? width : '100%')
  const heightValue = typeof height === 'number' ? height : (Platform.OS === 'web' ? height : 200)

  const isWeb = Platform.OS === 'web'
  const axis = flipDirection === 'x' ? 'X' : 'Y'
  const hoverClass = flipOnHover ? 'flip-card-hover' : ''

  // Render flashcard content nếu có word/meaning
  const renderFlashcardContent = () => {
    if (word || meaning) {
      // Flashcard mode
      const imageSrc = typeof image === 'string' 
        ? image 
        : (image && typeof image === 'object' && image.uri) 
          ? image.uri 
          : null

      if (isWeb) {
        // Web version với HTML tags
        return {
          front: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px',
              width: '100%',
              height: '100%',
            }}>
              {image && (
                <div style={{ 
                  marginBottom: word ? '16px' : '0',
                  maxWidth: '80%',
                  maxHeight: '60%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {typeof image === 'string' || (image && image.uri) ? (
                    <img 
                      src={imageSrc} 
                      alt={word || 'Flashcard'} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                      }} 
                    />
                  ) : (
                    image
                  )}
                </div>
              )}
              {word && (
                <p style={{ 
                  margin: 0, 
                  fontSize: '28px', 
                  fontWeight: '700',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {word}
                </p>
              )}
            </div>
          ),
          back: (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '20px',
              width: '100%',
              height: '100%',
            }}>
              {meaning && (
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '600',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                  {meaning}
                </p>
              )}
            </div>
          ),
        }
      } else {
        // Native version với React Native components
        return {
          front: (
            <View style={{ 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20,
              width: '100%',
              height: '100%',
            }}>
              {image && (
                <View style={{ 
                  marginBottom: word ? 16 : 0,
                  maxWidth: '80%',
                  maxHeight: '60%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {typeof image === 'string' || (image && image.uri) ? (
                    <Image 
                      source={{ uri: imageSrc }} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        resizeMode: 'contain',
                        borderRadius: 8,
                      }} 
                    />
                  ) : (
                    image
                  )}
                </View>
              )}
              {word ? (
                <Text style={{ 
                  margin: 0, 
                  fontSize: 28, 
                  fontWeight: '700',
                  textAlign: 'center',
                  color: '#fff',
                }}>
                  {String(word)}
                </Text>
              ) : null}
            </View>
          ),
          back: (
            <View style={{ 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20,
              width: '100%',
              height: '100%',
            }}>
              {meaning ? (
                <Text style={{ 
                  margin: 0, 
                  fontSize: 24, 
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#fff',
                }}>
                  {String(meaning)}
                </Text>
              ) : null}
            </View>
          ),
        }
      }
    }
    
    // Custom content mode
    return {
      front: frontContent,
      back: backContent,
    }
  }

  const content = renderFlashcardContent()

  // Render sound icon nếu có
  const renderSoundIcon = () => {
    // Hiển thị icon sound khi có onPlaySound
    if (!onPlaySound) return null

    // Xử lý SoundIcon - có thể là string URL, object với src/uri/default
    const soundSrc = typeof SoundIcon === 'string' 
      ? SoundIcon 
      : (SoundIcon?.src || SoundIcon?.uri || SoundIcon?.default)
    
    if (!soundSrc) return null

    const soundStyle = {
      position: 'absolute',
      top: 8,
      right: starIcon && onToggleFavorite ? 52 : 8,
      zIndex: 10,
      padding: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
    }

    const iconStyle = {
      width: 28,
      height: 28,
      opacity: 0.5,
    }

    if (isWeb) {
      return (
        <div 
          style={soundStyle} 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (onPlaySound) {
              onPlaySound(); 
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={(e) => { 
            const img = e.currentTarget.querySelector('img')
            if (img) {
              img.style.filter = 'opacity(1)'
            }
          }}
          onMouseLeave={(e) => { 
            const img = e.currentTarget.querySelector('img')
            if (img) {
              img.style.filter = 'opacity(0.5)'
            }
          }}
        >
          <img 
            src={soundSrc} 
            alt="Play sound" 
            style={iconStyle}
          />
        </div>
      )
    } else {
      return (
        <Pressable 
          style={soundStyle} 
          onPress={(e) => { 
            e?.stopPropagation?.(); 
            if (onPlaySound) {
              onPlaySound(); 
            }
          }}
        >
          <Image 
            source={{ uri: soundSrc }} 
            style={iconStyle}
            resizeMode="contain"
          />
        </Pressable>
      )
    }
  }

  // Render star icon nếu có
  const renderStarIcon = () => {
    if (!starIcon || !onToggleFavorite) return null
    
    const starStyle = {
      position: 'absolute',
      top: 8,
      right: 8,
      zIndex: 10,
      padding: 8,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
    }

    const iconStyle = {
      width: 28,
      height: 28,
    }

    // Nếu starIcon là React component hoặc element
    if (React.isValidElement(starIcon)) {
      if (isWeb) {
        return (
          <div 
            style={starStyle} 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {React.cloneElement(starIcon, { 
              style: { 
                ...iconStyle, 
                filter: isFavorite 
                  ? 'brightness(0) saturate(100%) invert(85%) sepia(50%) saturate(2000%) hue-rotate(5deg) brightness(1.1)' 
                  : 'opacity(0.5)',
                ...starIcon.props?.style 
              } 
            })}
          </div>
        )
      } else {
        return (
          <Pressable 
            style={starStyle} 
            onPress={(e) => { e?.stopPropagation?.(); onToggleFavorite(); }}
          >
            {React.cloneElement(starIcon, { 
              style: { 
                ...iconStyle, 
                opacity: isFavorite ? 1 : 0.5,
                tintColor: isFavorite ? '#FFD700' : undefined,
                ...starIcon.props?.style 
              } 
            })}
          </Pressable>
        )
      }
    }

    // Nếu starIcon là string (URL) hoặc object
    const starSrc = typeof starIcon === 'string' ? starIcon : (starIcon?.src || starIcon?.uri)
    if (starSrc) {
      if (isWeb) {
        return (
          <div 
            style={starStyle} 
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <img 
              src={starSrc} 
              alt="Favorite" 
              style={{
                ...iconStyle,
                filter: isFavorite 
                  ? 'brightness(0) saturate(100%) invert(85%) sepia(50%) saturate(2000%) hue-rotate(5deg) brightness(1.1)' 
                  : 'opacity(0.5)',
              }}
            />
          </div>
        )
      } else {
        return (
          <Pressable 
            style={starStyle} 
            onPress={(e) => { e?.stopPropagation?.(); onToggleFavorite(); }}
          >
            <Image 
              source={{ uri: starSrc }} 
              style={{
                ...iconStyle,
                opacity: isFavorite ? 1 : 0.5,
                tintColor: isFavorite ? '#FFD700' : undefined,
              }}
              resizeMode="contain"
            />
          </Pressable>
        )
      }
    }

    return null
  }

  if (isWeb) {
    // Web version với HTML và CSS
    const cardStyle = {
      width: widthValue,
      height: heightValue,
      perspective: '1000px',
      position: 'relative',
      ...style,
    }

    const cardInnerStyle = {
      width: '100%',
      height: '100%',
      position: 'relative',
      transformStyle: 'preserve-3d',
      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isFlipped ? `rotate${axis}(180deg)` : `rotate${axis}(0deg)`,
      willChange: 'transform',
    }

    const cardFaceStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#fff',
      borderRadius: `${borderRadius}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }

    const cardFrontStyle = {
      ...cardFaceStyle,
      backgroundColor: frontColor,
      border: `${borderWidth}px solid ${frontColor}`,
      transform: `rotate${axis}(0deg)`,
    }

    const cardBackStyle = {
      ...cardFaceStyle,
      backgroundColor: backColor,
      border: `${borderWidth}px solid ${backColor}`,
      transform: `rotate${axis}(180deg)`,
    }

    return (
      <>
        <div
          className={`flip-card ${hoverClass} ${className} ${!flipOnHover ? 'flip-card-clickable' : ''}`}
          style={cardStyle}
          onClick={!flipOnHover ? handleFlip : undefined}
        >
          <div className="flip-card-inner" style={cardInnerStyle}>
            <div className="flip-card-front" style={cardFrontStyle}>
              {content.front}
              {renderSoundIcon()}
              {renderStarIcon()}
            </div>
            <div className="flip-card-back" style={cardBackStyle}>
              {content.back}
              {renderSoundIcon()}
              {renderStarIcon()}
            </div>
          </div>
        </div>
      </>
    )
  } else {
    // Native version với React Native components
    // Sử dụng opacity và scale vì React Native không hỗ trợ 3D transforms như web
    const cardStyle = {
      width: widthValue,
      height: heightValue,
      ...style,
    }

    return (
      <Pressable
        style={cardStyle}
        onPress={!flipOnHover ? handleFlip : undefined}
      >
        <View style={{ width: '100%', height: '100%' }}>
          {/* Front face */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: frontColor,
                borderWidth: borderWidth,
                borderColor: frontColor,
                borderRadius: borderRadius,
                alignItems: 'center',
                justifyContent: 'center',
              },
              {
                opacity: frontOpacity,
                transform: [{ scale }],
              },
            ]}
          >
            {content.front}
            {renderSoundIcon()}
            {renderStarIcon()}
          </Animated.View>

          {/* Back face */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: backColor,
                borderWidth: borderWidth,
                borderColor: backColor,
                borderRadius: borderRadius,
                alignItems: 'center',
                justifyContent: 'center',
              },
              {
                opacity: backOpacity,
                transform: [{ scale }],
              },
            ]}
          >
            {content.back}
            {renderSoundIcon()}
            {renderStarIcon()}
          </Animated.View>
        </View>
      </Pressable>
    )
  }
}

export default FlipCard

