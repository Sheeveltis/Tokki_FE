import React from 'react'
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

  const handleFlip = () => {
    if (controlledFlipped === undefined) {
      setInternalFlipped(!internalFlipped)
    }
    if (onFlip) {
      onFlip(!isFlipped)
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
    if (word || meaning) {
      // Flashcard mode
      const imageSrc = typeof image === 'string' 
        ? image 
        : (image && typeof image === 'object' && image.uri) 
          ? image.uri 
          : null

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

    // Xử lý SoundIcon - có thể là string URL, object với src/uri/default
    const soundSrc = typeof SoundIcon === 'string' 
      ? SoundIcon 
      : (SoundIcon?.src || SoundIcon?.uri || SoundIcon?.default)
    
    if (!soundSrc) return null

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
  }

  // Render star icon nếu có
  const renderStarIcon = () => {
    if (!starIcon || !onToggleFavorite) return null
    
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

    return null
  }

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
}

export default FlipCard

