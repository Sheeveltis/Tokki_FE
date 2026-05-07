import React from 'react'

/**
 * Tính offset vuông góc ra phía ngoài cho đường guide arrow
 * để mũi tên nằm sát bên ngoài đường guide xám mà không đè lên
 */
function offsetPolyline(points, offsetDist) {
  if (!points || points.length < 2) return points
  
  const result = []
  for (let i = 0; i < points.length; i++) {
    let nx = 0, ny = 0
    
    if (i === 0) {
      const dx = points[1][0] - points[0][0]
      const dy = points[1][1] - points[0][1]
      const len = Math.hypot(dx, dy) || 1
      nx = -dy / len
      ny = dx / len
    } else if (i === points.length - 1) {
      const dx = points[i][0] - points[i - 1][0]
      const dy = points[i][1] - points[i - 1][1]
      const len = Math.hypot(dx, dy) || 1
      nx = -dy / len
      ny = dx / len
    } else {
      const dx1 = points[i][0] - points[i - 1][0]
      const dy1 = points[i][1] - points[i - 1][1]
      const len1 = Math.hypot(dx1, dy1) || 1
      const dx2 = points[i + 1][0] - points[i][0]
      const dy2 = points[i + 1][1] - points[i][1]
      const len2 = Math.hypot(dx2, dy2) || 1
      nx = (-dy1 / len1 + -dy2 / len2) / 2
      ny = (dx1 / len1 + dx2 / len2) / 2
      const nlen = Math.hypot(nx, ny) || 1
      nx /= nlen
      ny /= nlen
    }
    
    result.push([points[i][0] + nx * offsetDist, points[i][1] + ny * offsetDist])
  }
  return result
}

/**
 * GuideStrokes (Web): Displays tolerance zones + guide lines (red) based on JSON.
 * Optimized for scaling using viewBox.
 * 
 * Mũi tên chỉ hướng được vẽ DỌC THEO đường guide chính (hangulPoints),
 * offset nhẹ ra ngoài để không đè lên vùng vẽ.
 * Điều này đảm bảo user nhìn mũi tên và vẽ đúng trên đường guide → điểm cao.
 */
export function GuideStrokes({ strokes, guides, show, activeStrokeIndex = 0 }) {
  if (!show || !strokes || strokes.length === 0) return null

  const SCALE = 1000
  const MARGIN = 150 
  const DRAW_AREA = SCALE - MARGIN * 2
  const ARROW_OFFSET = 0.04 // offset mũi tên ra ngoài (normalized)

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

  // Vẽ mũi tên DỌC THEO đường stroke chính, offset ra ngoài
  const guideLines = (strokes || [])
    .map((stroke, index) => {
      if (!stroke || stroke.length < 2) return ''
      const isActive = index === activeStrokeIndex
      const opacity = isActive ? 1 : 0.2

      const guide = guides?.[index]
      const labelValue = guide?.numberLabel?.value ?? (index + 1)

      // Offset đường stroke ra ngoài để tạo đường mũi tên
      const offsetStroke = offsetPolyline(stroke, ARROW_OFFSET)

      const arrowPoints = offsetStroke
        .map(([x, y]) => `${tx(x)},${ty(y)}`)
        .join(' ')

      // Vị trí số thứ tự: gần điểm đầu, offset ra ngoài
      const labelPos = offsetStroke[0]

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
            cx="${tx(labelPos[0])}"
            cy="${ty(labelPos[1])}"
            r="30"
            fill="#FF4D4F"
            stroke="#fff"
            stroke-width="5"
          />
          <text
            x="${tx(labelPos[0])}"
            y="${ty(labelPos[1]) + 10}"
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
