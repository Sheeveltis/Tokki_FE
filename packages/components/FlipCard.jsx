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
 *   pronunciation?: string; - Phiên âm hiển thị ở mặt trước
 *   exampleSentence?: string; - Câu ví dụ hiển thị ở mặt sau
 *   exampleTranslation?: string; - Dịch nghĩa câu ví dụ
 *   exampleImage?: string | { uri: string }; - Hình ảnh ví dụ
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
  pronunciation,
  exampleSentence,
  exampleTranslation,
  exampleImage,
  _raw,
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
          // Mặt trước: hiển thị từ (word) + phiên âm (pronunciation)
          front: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px 20px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              background: `linear-gradient(135deg, ${frontColor} 0%, ${frontColor}dd 100%)`,
            }}>
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                fontSize: '12px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Tiếng Hàn
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                {word && (
                  <p style={{ 
                    margin: 0, 
                    fontSize: '64px', 
                    fontWeight: '900',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    color: '#FFFFFF',
                    textShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontFamily: 'Epilogue, sans-serif',
                  }}>
                    {word}
                  </p>
                )}
                {onPlaySound && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySound();
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backdropFilter: 'blur(8px)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15.54 8.46C16.4771 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4771 14.5924 15.54 15.53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>

              {pronunciation && (
                <p style={{ 
                  margin: '12px 0 0 0', 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textAlign: 'center',
                  fontFamily: 'Epilogue, sans-serif',
                }}>
                  [{pronunciation}]
                </p>
              )}

              <div style={{
                position: 'absolute',
                bottom: '80px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Nhấn Space hoặc chạm vào thẻ để xem nghĩa
              </div>

              {footer && (
                <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 5 }}>
                  {footer}
                </div>
              )}
            </div>
          ),
          // Mặt sau: định nghĩa + ví dụ
          back: (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '40px',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '800',
                color: '#999',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}>
                Định nghĩa
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%',
                gap: '24px',
                marginBottom: '32px',
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '32px', 
                  fontWeight: '900',
                  color: '#1A1A1A',
                  fontFamily: 'Epilogue, sans-serif',
                }}>
                  {meaning}
                </h2>
              </div>

              {image && (
                <div style={{ 
                  width: '100%', 
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '32px',
                }}>
                  <div style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    backgroundColor: '#F9FAFB',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}>
                    <img 
                      src={typeof image === 'string' ? image : image.uri} 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        display: 'block',
                        objectFit: 'contain' 
                      }} 
                      alt="Vocabulary"
                    />
                  </div>
                </div>
              )}

              {/* Example Section */}
              {(() => {
                const exSentence = exampleSentence || (Array.isArray(_raw?.examples) && _raw.examples[0]?.sentence) || _raw?.exampleSentence;
                const exTranslation = exampleTranslation || (Array.isArray(_raw?.examples) && _raw.examples[0]?.translation) || _raw?.exampleTranslation;
                const exImage = exampleImage || (Array.isArray(_raw?.examples) && _raw.examples[0]?.imgURL) || _raw?.exampleImgURL;

                if (!exSentence && !exImage) return null;

                return (
                  <div style={{ 
                    width: '100%',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: '#F8FAFB',
                    borderRadius: '24px',
                    border: '1px solid #F0F2F5',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color: colors.primary || '#79964E',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: colors.primary || '#79964E' }} />
                      Ví dụ minh họa
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      {exImage && (
                        <div style={{ 
                          width: '120px', 
                          height: '120px', 
                          borderRadius: '16px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}>
                          <img 
                            src={typeof exImage === 'string' ? exImage : exImage.uri} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt="Example"
                          />
                        </div>
                      )}

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {exSentence && (
                          <p style={{ 
                            margin: 0, 
                            fontSize: '20px', 
                            fontWeight: '700',
                            color: '#1A1A1A',
                            lineHeight: '1.4',
                            fontFamily: 'Epilogue, sans-serif',
                          }}>
                            {exSentence}
                          </p>
                        )}
                        {exTranslation && (
                          <p style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            color: '#666',
                            fontWeight: '500',
                            fontFamily: 'Epilogue, sans-serif',
                          }}>
                            {exTranslation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
          // Mặt trước
          front: (
            <View style={{ 
              flex: 1,
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 20,
              width: '100%',
              height: '100%',
              backgroundColor: frontColor,
            }}>
              {word && (
                <Text style={{ 
                  fontSize: 48, 
                  fontWeight: '900',
                  textAlign: 'center',
                  color: '#FFF',
                }}>
                  {word}
                </Text>
              )}
              {pronunciation && (
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600',
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 10,
                }}>
                  [{pronunciation}]
                </Text>
              )}
            </View>
          ),
          // Mặt sau
          back: (
            <View style={{ 
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start', 
              justifyContent: 'center',
              padding: 30,
              width: '100%',
              height: '100%',
              backgroundColor: '#FFF',
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#999', marginBottom: 10 }}>ĐỊNH NGHĨA</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 20 }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: '#1A1A1A', flex: 1 }}>{meaning}</Text>
                {image && (
                  <Image 
                    source={typeof image === 'string' ? { uri: image } : image} 
                    style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#F5F5F5' }} 
                    resizeMode="cover"
                  />
                )}
              </View>
              
              {exampleSentence && (
                <View style={{ padding: 15, backgroundColor: '#F5F5F5', borderRadius: 15, width: '100%' }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#79964E', marginBottom: 5 }}>VÍ DỤ:</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', fontStyle: 'italic' }}>"{exampleSentence}"</Text>
                </View>
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
        top: '12px',
        right: onToggleFavorite ? '64px' : '12px',
        zIndex: 10,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }

      const iconStyle = {
        width: '24px',
        height: '24px',
        filter: 'brightness(0) invert(1)',
        transition: 'all 0.2s',
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
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
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
      return (
        <Pressable 
          onPress={onPlaySound}
          style={{
            position: 'absolute',
            top: 10,
            right: onToggleFavorite ? 60 : 10,
            zIndex: 15,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 24, color: '#FFF' }}>🔊</Text>
        </Pressable>
      )
    }
  }

  // Render star icon nếu có
  const renderStarIcon = () => {
    if (!onToggleFavorite) return null

    if (isWeb) {
      const starStyle = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.2s ease',
      }

      // Default Heart Icon SVG if starIcon not provided
      const HeartIcon = (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "#EF4444" : "none"} xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
            stroke={isFavorite ? "#EF4444" : "#FFFFFF"} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      )

      return (
        <div 
          style={starStyle} 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {React.isValidElement(starIcon) ? starIcon : HeartIcon}
        </div>
      )
    } else {
      // React Native version
      return (
        <Pressable
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 15,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={(e) => {
            if (e?.stopPropagation) e.stopPropagation()
            onToggleFavorite()
          }}
        >
          <Text style={{ fontSize: 24, color: isFavorite ? '#EF4444' : '#FFF' }}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </Pressable>
      )
    }
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

