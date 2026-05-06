import React from 'react'

/**
 * GuideStrokes (Web): Displays tolerance zones + guide lines (red) based on JSON.
 * Optimized for scaling using viewBox.
 */
export function GuideStrokes({ strokes, guides, show, activeStrokeIndex = 0 }) {
  if (!show || !strokes || strokes.length === 0) return null

  const SCALE = 1000
  const MARGIN = 150 
  const DRAW_AREA = SCALE - MARGIN * 2

  // 1. Extract all points to find bounding box
  const allPoints = []
  strokes.forEach(stroke => {
    if (Array.isArray(stroke)) {
      stroke.forEach(p => {
        if (Array.isArray(p) && p.length >= 2) {
          allPoints.push(p)
        }
      })
    }
  })

  if (allPoints.length === 0) return null

  const xs = allPoints.map(p => p[0])
  const ys = allPoints.map(p => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  const contentWidth = maxX - minX || 0.001
  const contentHeight = maxY - minY || 0.001
  const scale = Math.min(DRAW_AREA / contentWidth, DRAW_AREA / contentHeight)

  const tx = (x) => {
    const centeredX = x - (minX + maxX) / 2
    return centeredX * scale + SCALE / 2
  }
  const ty = (y) => {
    const centeredY = y - (minY + maxY) / 2
    return centeredY * scale + SCALE / 2
  }

  const guideLines = (guides || [])
    .map((g, index) => {
      if (!g || !g.arrowPath || g.arrowPath.length === 0) return ''
      const isActive = index === activeStrokeIndex
      const opacity = isActive ? 1 : 0.2

      const arrowPoints = g.arrowPath
        .map(([x, y]) => `${tx(x)},${ty(y)}`)
        .join(' ')

      const labelPos = g.numberLabel?.position || g.arrowPath[0]
      const [nx, ny] = labelPos
      const labelValue = g.numberLabel?.value ?? (index + 1)

      return `
        <polyline
          points="${arrowPoints}"
          fill="none"
          stroke="#FF4D4F"
          stroke-width="6"
          stroke-dasharray="12 12"
          stroke-linecap="round"
          stroke-linejoin="round"
          marker-end="url(#arrow-red)"
          opacity="${opacity}"
        />
        <g opacity="${opacity}">
          <circle
            cx="${tx(nx)}"
            cy="${ty(ny)}"
            r="30"
            fill="#FF4D4F"
            stroke="#fff"
            stroke-width="5"
          />
          <text
            x="${tx(nx)}"
            y="${ty(ny) + 10}"
            text-anchor="middle"
            font-size="32"
            font-weight="bold"
            fill="#FFFFFF"
            font-family="Arial, sans-serif"
          >
            ${labelValue}
          </text>
        </g>
      `
    })
    .join('')

  const mainStrokes = (strokes || [])
    .map((stroke, index) => {
      if (!stroke || stroke.length === 0) return ''
      const isActive = index === activeStrokeIndex
      const opacity = isActive ? 1 : 0.15

      const points = stroke
        .map(([x, y]) => `${tx(x)},${ty(y)}`)
        .join(' ')

      let startIndicator = ''
      if (isActive) {
        startIndicator = `
          <circle 
            cx="${tx(stroke[0][0])}" 
            cy="${ty(stroke[0][1])}" 
            r="35" 
            fill="#4CAF50" 
            stroke="#fff" 
            stroke-width="10">
            <animate attributeName="r" values="30;40;30" dur="1.5s" repeatCount="indefinite" />
          </circle>
        `
      }

      return `
        <polyline
          points="${points}"
          fill="none"
          stroke="#F0F0F0"
          stroke-width="100"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="${opacity}"
        />
        <polyline
          points="${points}"
          fill="none"
          stroke="#D9D9D9"
          stroke-width="2"
          stroke-dasharray="8 8"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="${opacity}"
        />
        ${startIndicator}
      `
    })
    .join('')

  const svgContent = `
    <svg viewBox="0 0 ${SCALE} ${SCALE}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#FF4D4F" />
        </marker>
      </defs>
      <g>
        ${mainStrokes}
        ${guideLines}
      </g>
    </svg>
  `

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

