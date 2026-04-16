import React from 'react'

/**
 * AuthLayout: layout chia đôi màn hình cho hero (bên trái) và panel (bên phải)
 *
 * @param {{
 *   hero: React.ReactNode
 *   panel: React.ReactNode
 * }} props
 */
export function AuthLayout({ hero, panel }) {
  return (
    <div style={rootStyle}>
      <div style={splitStyle}>
        <div style={heroStyle}>{hero}</div>
        <div style={panelStyle}>{panel}</div>
      </div>
    </div>
  )
}

const rootStyle = {
  display: 'flex',
  width: '100%',
  height: '100vh',
  // minHeight: '50vh',
  backgroundColor: 'white',
  overflow: 'hidden',
}

const splitStyle = {
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
  flex: 1,
}

const heroStyle = {
  flex: 1,
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
}

const panelStyle = {
  flex: 1,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflowY: 'auto',
}


