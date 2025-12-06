import React from 'react'
import './Loading.css'

/**
 * Component Loading với animation từ Uiverse.io
 * 
 * @param {{
 *   size?: number; - Kích thước loader (mặc định 48px)
 *   color?: string; - Màu loader (mặc định #f08080)
 *   shadowColor?: string; - Màu shadow (mặc định #f0808050)
 *   text?: string; - Text hiển thị dưới loader
 *   textStyle?: React.CSSProperties; - Custom styles cho text
 *   style?: React.CSSProperties; - Custom styles cho container
 *   className?: string; - Custom className cho loader
 * }} props
 */
export function Loading({
  size = 48,
  color = '#f08080',
  shadowColor = '#f0808050',
  text,
  textStyle,
  style,
  className = '',
}) {
  const loaderStyle = {
    width: `${size}px`,
    height: `${size}px`,
    '--loader-size': `${size}px`,
    '--loader-color': color,
    '--loader-shadow-color': shadowColor,
    '--loader-shadow-height': `${Math.max(3, size * 0.104)}px`,
    '--loader-shadow-top': `${size * 1.25}px`,
    ...style,
  }

  const defaultTextStyle = {
    marginTop: '20px',
    color: '#333',
    fontSize: '14px',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    ...textStyle,
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        .loader-custom:before {
          width: var(--loader-size) !important;
          height: var(--loader-shadow-height) !important;
          background: var(--loader-shadow-color) !important;
          top: var(--loader-shadow-top) !important;
        }
        .loader-custom:after {
          background: var(--loader-color) !important;
        }
      `}</style>
      <div
        className={`loader loader-custom ${className}`}
        style={loaderStyle}
      />
      {text && (
        <p style={defaultTextStyle}>
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Component Loading với container wrapper
 * 
 * @param {{
 *   size?: number;
 *   color?: string;
 *   shadowColor?: string;
 *   fullScreen?: boolean; - Hiển thị full screen với overlay
 *   overlay?: boolean; - Có overlay mờ phía sau
 *   text?: string; - Text hiển thị dưới loader
 *   textStyle?: React.CSSProperties; - Custom styles cho text
 *   style?: React.CSSProperties;
 *   className?: string;
 * }} props
 */
export function LoadingWithContainer({
  size = 48,
  color = '#f08080',
  shadowColor = '#f0808050',
  fullScreen = false,
  overlay = false,
  text,
  textStyle,
  style,
  className = '',
}) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
    ...(overlay && {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }),
    ...style,
  }

  return (
    <div style={containerStyle} className={className}>
      <Loading 
        size={size} 
        color={color} 
        shadowColor={shadowColor} 
        text={text}
        textStyle={textStyle}
      />
    </div>
  )
}

export default Loading

