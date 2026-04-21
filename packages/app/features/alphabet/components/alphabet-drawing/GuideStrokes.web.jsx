import React from 'react'

/**
 * GuideStrokes (Web): Hiển thị vùng tolerance + đường guide (đỏ) dựa trên JSON
 */
export function GuideStrokes({ strokes, guides, width, height, show }) {
  if (!show || !strokes || !width || !height) return null

  const toleranceZoneWidth = 10 // vùng cho phép màu xanh nhạt

  const guideLines = (guides || [])
    .map((g) => {
      if (!g || !g.arrowPath || g.arrowPath.length === 0) return ''

      const arrowPoints = g.arrowPath
        .map(([x, y]) => `${x * width},${y * height}`)
        .join(' ')

      const last = g.arrowPath[g.arrowPath.length - 1]
      const [lx, ly] = last

      const labelPos = g.numberLabel?.position || g.arrowPath[0]
      const [nx, ny] = labelPos
      const labelValue = g.numberLabel?.value ?? ''

      return `
        <!-- Đường guide đỏ (mảnh, đứt đoạn) -->
        <polyline
          points="${arrowPoints}"
          fill="none"
          stroke="#D4060A"
          stroke-width="1"
          stroke-dasharray="4 4"
          stroke-linecap="round"
          stroke-linejoin="round"
          marker-end="url(#arrow-red)"
        />
        <!-- Số thứ tự nét -->
        <circle
          cx="${nx * width}"
          cy="${ny * height}"
          r="8"
          fill="#FFFFFF"
          stroke="#D4060A"
          stroke-width="1.5"
        />
        <text
          x="${nx * width}"
          y="${ny * height + 4}"
          text-anchor="middle"
          font-size="10"
          font-weight="700"
          fill="#D4060A"
        >
          ${labelValue}
        </text>
      `
    })
    .join('')

  const mainStrokes = (strokes || [])
    .map((stroke) => {
      if (!stroke || stroke.length === 0) return ''
      const points = stroke
        .map(([x, y]) => `${x * width},${y * height}`)
        .join(' ')

      return `
        <!-- Vùng tolerance zone (vùng cho phép) -->
        <polyline
          points="${points}"
          fill="none"
          stroke="#E8F5E9"
          stroke-width="${toleranceZoneWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.5"
        />
        <!-- Guide stroke chính (nét xám dày) -->
        <polyline
          points="${points}"
          fill="none"
          stroke="#E0E0E0"
          stroke-width="30"
          stroke-dasharray="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.5"
        />
      `
    })
    .join('')

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="position: absolute; top: 0; left: 0;">
      <defs>
        <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#D4060A" />
        </marker>
      </defs>
      ${mainStrokes}
      ${guideLines}
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
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

