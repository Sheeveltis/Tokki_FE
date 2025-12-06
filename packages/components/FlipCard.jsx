import React from 'react'

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
  isFlipped: controlledFlipped,
  onFlip,
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
    ...style,
  }

  const cardInnerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  }

  const cardFaceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
    borderRadius: `${borderRadius}px`,
  }

  const cardFrontStyle = {
    ...cardFaceStyle,
    backgroundColor: frontColor,
    border: `${borderWidth}px solid ${frontColor}`,
    transform: 'rotateY(0deg)',
  }

  const cardBackStyle = {
    ...cardFaceStyle,
    backgroundColor: backColor,
    border: `${borderWidth}px solid ${backColor}`,
    transform: 'rotateY(180deg)',
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
          </div>
          <div className="flip-card-back" style={cardBackStyle}>
            {content.back}
          </div>
        </div>
      </div>
    </>
  )
}

export default FlipCard

