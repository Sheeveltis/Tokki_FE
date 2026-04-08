import React from 'react'

/**
 * LoginHero (Web): cột bên trái màn đăng nhập
 * Dùng thuần HTML/CSS để đảm bảo ảnh full height hoạt động đúng.
 *
 * @param {{
 *  imageSource?: any          // hỗ trợ cũ: dùng làm background
 *  backgroundSource?: any     // hình background
 *  overlaySource?: any        // hình đè lên (artwork)
 * }} props
 */
export function LoginHero({ imageSource, backgroundSource, overlaySource }) {
  // Chuẩn hoá source: lấy URL string từ import module (Vite/webpack trả về .src hoặc string)
  const toUrl = (src) => {
    if (!src) return null
    if (typeof src === 'string') return src
    if (src.src) return src.src   // Vite static asset
    if (src.uri) return src.uri   // RN uri object
    return null
  }

  const bgUrl = toUrl(backgroundSource || imageSource)
  const overlayUrl = toUrl(overlaySource)

  return (
    <div style={containerStyle}>
      {/* Background image */}
      {bgUrl && (
        <img
          src={bgUrl}
          alt=""
          style={bgImgStyle}
        />
      )}

      {/* Overlay / artwork */}
      {overlayUrl && (
        <div style={overlayWrapperStyle}>
          <img
            src={overlayUrl}
            alt="hero artwork"
            style={overlayImgStyle}
          />
        </div>
      )}
    </div>
  )
}

const containerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}

const bgImgStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const overlayWrapperStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  boxSizing: 'border-box',
}

const overlayImgStyle = {
  width: '90%',
  height: '90%',
  objectFit: 'contain',
  filter: 'drop-shadow(0px 0px 40px rgba(244, 144, 12, 0.8))',
}
