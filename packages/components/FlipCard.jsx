import React from 'react'
import { Platform, View, Text, Image, StyleSheet, Pressable, Animated } from 'react-native'
import SoundIcon from '../assets/icon/icon-mainflow/sound.svg'

/**
 * Component FlipCard - Flashcard với animation flip 3D
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
 *   flipOnHover?: boolean; - Flip khi hover (mặc định true)
 *   isFlipped?: boolean; - Control flip từ bên ngoài (optional)
 *   onFlip?: (flipped: boolean) => void; - Callback khi flip
 *   starIcon?: React.ReactNode | string; - Icon star để hiển thị ở góc trên phải
 *   isFavorite?: boolean; - Trạng thái yêu thích
 *   onToggleFavorite?: () => void; - Callback khi click vào star
 *   onPlaySound?: () => void; - Callback khi click vào icon sound
 *   footer?: React.ReactNode; - Nội dung hiển thị ở cuối thẻ (cho cả 2 mặt)
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
  footer,
  className = '',
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

  const widthValue = typeof width === 'number' ? `${width}px` : width
  const heightValue = typeof height === 'number' ? `${height}px` : height

  const cardStyle = {
    width: widthValue,
    height: heightValue,
    perspective: '1000px',
    position: 'relative',
    ...style,
  }

  const axis = flipDirection === 'x' ? 'X' : 'Y'

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

  const hoverClass = flipOnHover ? 'flip-card-hover' : ''

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
    // Kiểm tra xem có prop nào được truyền vào không (kể cả undefined/null/empty string)
    // Vì nếu có prop được truyền vào, nghĩa là đang ở flashcard mode
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

      const isWeb = Platform.OS === 'web'

      if (isWeb) {
        // Web version với HTML elements
        return {
          // Mặt trước: chỉ hiển thị từ (word)
          front: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px 20px 80px 20px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}>
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
              {footer && (
                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5 }}>
                  {footer}
                </div>
              )}
            </div>
          ),
          // Mặt sau: hình + nghĩa
          back: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px 20px 100px 20px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
            }}>
              {image && (
                <div style={{ 
                  marginBottom: meaning ? '24px' : '0',
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 0,
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
              {footer && (
                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5 }}>
                  {footer}
                </div>
              )}
            </div>
          ),
        }
      } else {
        // React Native version
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
                }}>
                  {meaning}
                </Text>
              )}
            </View>
          ),
        }
      }
    }
    
    // Fallback: trả về empty content nếu không có dữ liệu
    const isWeb = Platform.OS === 'web'
    const EmptyContent = isWeb ? (
      <div style={{ width: '100%', height: '100%' }} />
    ) : (
      <View style={{ width: '100%', height: '100%' }} />
    )
    return {
      front: EmptyContent,
      back: EmptyContent,
    }
  }

  const content = renderFlashcardContent()
  const isWeb = Platform.OS === 'web'

  // Render sound icon nếu có
  const renderSoundIcon = () => {
    // Hiển thị icon sound khi có onPlaySound
    if (!onPlaySound) return null

    // Xử lý SoundIcon - có thể là string URL, object với src/uri/default
    const soundSrc = typeof SoundIcon === 'string' 
      ? SoundIcon 
      : (SoundIcon?.src || SoundIcon?.uri || SoundIcon?.default)
    
    if (!soundSrc) return null

    if (isWeb) {
      const soundStyle = {
        position: 'absolute',
        top: '8px',
        right: starIcon && onToggleFavorite ? '52px' : '8px',
        zIndex: 10,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        transition: 'opacity 0.2s',
      }

      const iconStyle = {
        width: '28px',
        height: '28px',
        filter: 'opacity(0.5)',
        transition: 'filter 0.2s',
      }

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
      // React Native version
      // Đảm bảo soundSrc được xử lý đúng
      const imageSource = typeof soundSrc === 'string' 
        ? { uri: soundSrc }
        : typeof soundSrc === 'number'
        ? soundSrc
        : soundSrc
        
      return (
        <Pressable
          style={{
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
          }}
          onPress={(e) => {
            if (e?.stopPropagation) {
              e.stopPropagation()
            }
            if (onPlaySound) {
              onPlaySound()
            }
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <Image
            source={imageSource}
            style={{
              width: 28,
              height: 28,
              opacity: 0.5,
            }}
          />
        </Pressable>
      )
    }
  }

  // Render star icon nếu có
  const renderStarIcon = () => {
    if (!starIcon || !onToggleFavorite) return null

    if (isWeb) {
      const starStyle = {
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
      }

      const iconStyle = {
        width: '28px',
        height: '28px',
        transition: 'filter 0.2s',
      }

      // Nếu starIcon là React component hoặc element
      if (React.isValidElement(starIcon)) {
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
      }

      // Nếu starIcon là string (URL) hoặc object
      const starSrc = typeof starIcon === 'string' ? starIcon : (starIcon?.src || starIcon?.uri)
      if (starSrc) {
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
      }
    } else {
      // React Native version
      // Xử lý nhiều trường hợp: string, object với uri/src, hoặc React component
      let starSrc = null
      
      if (typeof starIcon === 'string') {
        starSrc = starIcon
      } else if (starIcon && typeof starIcon === 'object') {
        // Nếu là object có uri hoặc src
        starSrc = starIcon.uri || starIcon.src
        // Nếu normalizeImageSource đã trả về { uri: '...' }
        if (!starSrc && starIcon.uri) {
          starSrc = starIcon.uri
        }
      }
      
      // Nếu không tìm thấy src, thử kiểm tra xem có phải là React component không
      if (!starSrc && React.isValidElement(starIcon)) {
        // Nếu là React component, không thể render trực tiếp trên React Native
        // Cần convert sang Image với source
        return null
      }
      
      if (starSrc) {
        // Đảm bảo starSrc là string hoặc number (require)
        const imageSource = typeof starSrc === 'string' 
          ? { uri: starSrc }
          : typeof starSrc === 'number'
          ? starSrc
          : starSrc
          
        return (
          <Pressable
            style={{
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
            }}
            onPress={(e) => {
              if (e?.stopPropagation) {
                e.stopPropagation()
              }
              onToggleFavorite()
            }}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
          >
            <Image
              source={imageSource}
              style={{
                width: 28,
                height: 28,
                opacity: isFavorite ? 1 : 0.5,
                tintColor: isFavorite ? '#F1BE4B' : undefined,
              }}
            />
          </Pressable>
        )
      }
    }

    return null
  }

  if (isWeb) {
    // Web version với HTML và CSS
    return (
      <>
        <style>{`
          .flip-card-hover:hover .flip-card-inner {
            transform: rotateY(180deg) !important;
          }
          .flip-card-clickable {
            cursor: pointer;
          }
        `}</style>
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
    // React Native version - sử dụng Animated API để tạo animation flip
    const flipAnimation = React.useRef(new Animated.Value(isFlipped ? 1 : 0)).current

    React.useEffect(() => {
      Animated.timing(flipAnimation, {
        toValue: isFlipped ? 1 : 0,
        duration: 300,
        useNativeDriver: true, // Dùng useNativeDriver cho opacity (được hỗ trợ tốt)
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
}

export default FlipCard

